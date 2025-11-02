// ========================================
// COMPLETED JOBS FUNCTIONALITY
// Display and manage completed jobs
// ========================================

// Load completed jobs
async function loadCompletedJobs() {
    // Load completed jobs from Firestore assigned to this worker
    try {
        // Wait for auth systems to initialize (if present)
        if (window.workerAuthGuard && typeof window.workerAuthGuard.init === 'function') {
            try { await window.workerAuthGuard.init() } catch (e) { console.warn('workerAuthGuard.init() err', e) }
        }
        if (window.workerAuth && typeof window.workerAuth.init === 'function') {
            try { await window.workerAuth.init() } catch (e) { console.warn('workerAuth.init() err', e) }
        }

        // determine worker uid using robust fallbacks
        let workerUid = null
        try {
            if (window.workerAuthGuard && window.workerAuthGuard.getUser) {
                const u = window.workerAuthGuard.getUser()
                workerUid = (u && (u.uid || u.id || u._id || u.userId)) || workerUid
            }
        } catch (e) { console.warn('workerAuthGuard.getUser() error:', e) }

        if (!workerUid) {
            try {
                if (window.workerAuth && window.workerAuth.getUser) {
                    const u = window.workerAuth.getUser()
                    workerUid = (u && (u.uid || u.id)) || workerUid
                }
            } catch (e) { console.warn('workerAuth.getUser() error:', e) }
        }

        if (!workerUid) {
            try {
                if (window.unifiedAuth && window.unifiedAuth.getUser) {
                    const u = window.unifiedAuth.getUser()
                    workerUid = (u && u.uid) || workerUid
                }
            } catch (e) { console.warn('unifiedAuth.getUser() error:', e) }
        }

        if (!workerUid) {
            try {
                const stored = localStorage.getItem('fixitnow_user')
                if (stored) {
                    const parsed = JSON.parse(stored)
                    workerUid = parsed.uid || workerUid
                }
            } catch (e) { /* ignore */ }
        }

        const grid = document.getElementById('completedJobsGrid')
        if (!workerUid) {
            // Show friendly message in UI instead of only console.warn
            console.warn('No worker UID for completed jobs')
            if (grid) grid.innerHTML = '<div style="padding:2rem;color:var(--text-secondary)">Please login to view your completed jobs.</div>'
            return
        }

        // Use realtime listener so completed jobs update immediately
        try {
            const query = db.collection('issues').where('assignedWorker','==',workerUid).where('status','==','completed')
            // Wrap subscription so if Firestore listen fails (400) we fallback to one-time fetch
            query.onSnapshot(snapshot => {
                const jobs = []
                snapshot.forEach(doc => jobs.push({ id: doc.id, ...doc.data() }))
                displayCompletedJobs(jobs)
                calculateTotalEarnings(jobs)
            }, err => {
                console.error('completed-jobs listener error:', err)
                if (grid) grid.innerHTML = '<div style="padding:2rem;color:var(--text-secondary)">Realtime unavailable — showing latest snapshot. Please refresh the page.</div>'
                // fallback to one-time fetch
                performOneTimeQuery(workerUid)
            })
        } catch (e) {
            console.error('Failed to start realtime listener for completed jobs:', e)
            if (grid) grid.innerHTML = '<div style="padding:2rem;color:var(--text-secondary)">Realtime unavailable — showing latest snapshot. Please refresh the page.</div>'
            performOneTimeQuery(workerUid)
        }
    } catch (err) {
        console.error('loadCompletedJobs error', err)
    }
}

// One-time fetch fallback when realtime listen fails
function performOneTimeQuery(workerUid) {
    db.collection('issues').where('assignedWorker','==',workerUid).where('status','==','completed').get()
      .then(snapshot => {
          const jobs = []
          snapshot.forEach(doc => jobs.push({ id: doc.id, ...doc.data() }))
          displayCompletedJobs(jobs)
          calculateTotalEarnings(jobs)
      })
      .catch(err => {
          console.error('performOneTimeQuery error:', err)
      })
}

// Display completed jobs
function displayCompletedJobs(jobs) {
    const grid = document.getElementById('completedJobsGrid');
    if (!grid) return;
    
    if (jobs.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <h3>No completed jobs yet</h3>
                <p>Completed jobs will appear here</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = jobs.map(job => createCompletedJobCard(job)).join('');

    // After rendering, populate customer details from the issue data itself
    jobs.forEach(job => {
        if (job.id) {
            updateCustomerDetailsFromIssue(job.id, job)
        }
    })
}

// Create completed job card
function createCompletedJobCard(job) {
    const completedDate = job.completedAt && job.completedAt.toDate ? job.completedAt.toDate().toLocaleDateString() : (job.completedDate ? new Date(job.completedDate).toLocaleDateString() : 'N/A');
    
    // Format earnings properly - handle object, string, or number
    let earningsText = 'N/A'
    if (job.budget) {
        if (typeof job.budget === 'object') {
            const min = job.budget.min || job.budget.minAmount
            const max = job.budget.max || job.budget.maxAmount
            if (min && max) {
                earningsText = `$${min} - $${max}`
            } else if (min) {
                earningsText = `$${min}`
            } else if (max) {
                earningsText = `$${max}`
            }
        } else if (typeof job.budget === 'number') {
            earningsText = `$${job.budget}`
        } else if (typeof job.budget === 'string') {
            earningsText = job.budget.startsWith('$') ? job.budget : `$${job.budget}`
        }
    } else if (job.estimatedBudget) {
        earningsText = typeof job.estimatedBudget === 'string' ? job.estimatedBudget : `$${job.estimatedBudget}`
    } else if (job.payment) {
        earningsText = typeof job.payment === 'string' ? job.payment : `$${job.payment}`
    }

    const photosHtml = (job.completionPhotos && job.completionPhotos.length) ? job.completionPhotos.map(u => `<img src="${u}" style="width:160px;height:120px;object-fit:cover;border-radius:8px;margin:6px">`).join('') : ''

    // Resolve location into a friendly string
    let locationText = ''
    if (!job.location) {
        locationText = job.address || 'Location not provided'
    } else if (typeof job.location === 'string') {
        locationText = job.location
    } else {
        const parts = []
        if (job.location.address) parts.push(job.location.address)
        if (job.location.city) parts.push(job.location.city)
        if (job.location.state) parts.push(job.location.state)
        if (job.location.zipCode) parts.push(job.location.zipCode)
        locationText = parts.join(', ') || (job.address || 'Location not provided')
    }

    return `
        <div class="job-card completed-job-card" style="background: linear-gradient(135deg, #0f172a 0%, #1a2541 100%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 16px; color: #e6eef6;">
            <!-- Card Header: Title + Status -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; gap: 12px;">
                <div>
                    <h3 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #fff;">${job.title}</h3>
                    <span style="display: inline-block; background: #3b82f6; color: white; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">${job.category || 'N/A'}</span>
                </div>
                <span style="display: inline-block; background: #10b981; color: white; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;">Completed</span>
            </div>

            <!-- Description -->
            <p style="margin: 12px 0; color: #cbd5e1; font-size: 14px; line-height: 1.5;">${job.description}</p>

            <!-- Meta Info: Location, Date, Earnings -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; font-size: 13px;">
                <div style="display: flex; align-items: center; gap: 8px; color: #cbd5e1;">
                    <i class="fas fa-map-marker-alt" style="color: #3b82f6; width: 16px;"></i>
                    <span>${locationText}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; color: #cbd5e1;">
                    <i class="fas fa-calendar-check" style="color: #10b981; width: 16px;"></i>
                    <span>Completed: ${completedDate}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; color: #cbd5e1;">
                    <i class="fas fa-dollar-sign" style="color: #f59e0b; width: 16px;"></i>
                    <span>Earned: ${earningsText}</span>
                </div>
            </div>

            <!-- Customer Details Section -->
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 12px; margin: 16px 0;">
                <h4 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 600; color: #fff; text-transform: uppercase; letter-spacing: 0.5px;">Customer Details</h4>
                <div class="customer-info" id="customer-${job.id}" data-userid="${job.userId || ''}">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                        <i class="fas fa-user" style="color: #64748b; width: 18px;"></i>
                        <span class="customer-name" style="color: #cbd5e1; font-size: 13px; flex: 1;">${job.customerName || (job.userId ? 'Loading...' : 'N/A')}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px 0;">
                        <i class="fas fa-phone" style="color: #64748b; width: 18px;"></i>
                        <span class="customer-phone" style="color: #cbd5e1; font-size: 13px; flex: 1;">${job.customerPhone || (job.userId ? 'Loading...' : '')}</span>
                    </div>
                </div>
            </div>

            <!-- Completion Photos -->
            ${photosHtml ? `<div style="margin-top: 14px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; max-height: 200px; overflow-y: auto;">${photosHtml}</div>` : ''}
        </div>
    `;
}

// Calculate total earnings
function calculateTotalEarnings(jobs) {
    let total = 0;
    
    jobs.forEach(job => {
        // Support multiple budget shapes: string like "$150-300", number, or {min,max}
        if (!job) return
        if (typeof job === 'number') {
            total += job
            return
        }

        if (job.budget && typeof job.budget === 'object') {
            const min = job.budget.min || job.budget.minAmount || null
            const max = job.budget.max || job.budget.maxAmount || null
            if (min && max) {
                total += (Number(min) + Number(max)) / 2
                return
            } else if (min) {
                total += Number(min)
                return
            }
        }

        if (job.estimatedBudget && typeof job.estimatedBudget === 'string') {
            const matches = job.estimatedBudget.match(/\d+/g);
            if (matches && matches.length >= 2) {
                const min = parseInt(matches[0]);
                const max = parseInt(matches[1]);
                total += (min + max) / 2;
                return
            } else if (matches && matches.length === 1) {
                total += parseInt(matches[0]);
                return
            }
        }

        if (job.payment && typeof job.payment === 'number') {
            total += job.payment
            return
        }

        if (job.payment && job.payment.amount) {
            total += Number(job.payment.amount)
            return
        }

        if (typeof job.estimatedBudget === 'number') {
            total += job.estimatedBudget
            return
        }
    });
    
    const earningsElement = document.getElementById('totalEarnings');
    if (earningsElement) {
        earningsElement.textContent = `$${total.toFixed(2)}`;
    }
}

// View job details
function viewDetails(jobId) {
    // Prefer to show the issue detail page if available
    if (window.location.pathname.includes('/pages/')) {
        window.location.href = `issue-detail.html?id=${jobId}`
    } else {
        window.location.href = `pages/issue-detail.html?id=${jobId}`
    }
}

// Update customer details from issue data
function updateCustomerDetailsFromIssue(jobId, jobData) {
    const container = document.getElementById(`customer-${jobId}`)
    if (!container) return
    
    const nameEl = container.querySelector('.customer-name')
    const phoneEl = container.querySelector('.customer-phone')
    
    // Extract customer info from the issue document
    let customerName = 'N/A'
    let customerPhone = 'N/A'
    
    // Try different possible field names where customer info might be stored
    if (jobData.contactName) customerName = jobData.contactName
    else if (jobData.customerName) customerName = jobData.customerName
    else if (jobData.userName) customerName = jobData.userName
    else if (jobData.reportedBy) customerName = jobData.reportedBy
    else if (jobData.user) customerName = jobData.user
    
    if (jobData.contactPhone) customerPhone = jobData.contactPhone
    else if (jobData.customerPhone) customerPhone = jobData.customerPhone
    else if (jobData.phone) customerPhone = jobData.phone
    else if (jobData.phoneNumber) customerPhone = jobData.phoneNumber
    else if (jobData.userPhone) customerPhone = jobData.userPhone
    
    // Update the display
    if (nameEl) nameEl.textContent = customerName || 'N/A'
    if (phoneEl) phoneEl.textContent = customerPhone || 'N/A'
    
    console.log('[completed-jobs] Updated customer details for job', jobId, '- Name:', customerName, 'Phone:', customerPhone)
}

// Fetch customer info and populate the card area (legacy function - kept for compatibility)
function fetchCustomerInfo(userId, jobId) {
    if (!userId) return
    db.collection('users').doc(userId).get().then(doc => {
        if (!doc.exists) return
        const data = doc.data()
        const container = document.getElementById(`customer-${jobId}`)
        if (!container) return
        const nameEl = container.querySelector('.customer-name')
        const phoneEl = container.querySelector('.customer-phone')
        if (nameEl) nameEl.textContent = data.name || data.displayName || data.fullName || data.email || 'User'
        if (phoneEl) phoneEl.textContent = data.phone || data.phoneNumber || ''
    }).catch(err => console.warn('fetchCustomerInfo error', err))
}

// Filter functionality
function setupFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchInput');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
}

// Apply filters
function applyFilters() {
    const allJobs = JSON.parse(localStorage.getItem('jobRequests')) || [];
    let filteredJobs = allJobs.filter(job => job.status === 'completed');
    
    // Apply status filter (time period)
    const statusFilter = document.getElementById('statusFilter').value;
    const now = new Date();
    
    if (statusFilter === 'this-month') {
        filteredJobs = filteredJobs.filter(job => {
            if (!job.completedDate) return false;
            const jobDate = new Date(job.completedDate);
            return jobDate.getMonth() === now.getMonth() && jobDate.getFullYear() === now.getFullYear();
        });
    } else if (statusFilter === 'last-month') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        filteredJobs = filteredJobs.filter(job => {
            if (!job.completedDate) return false;
            const jobDate = new Date(job.completedDate);
            return jobDate.getMonth() === lastMonth.getMonth() && jobDate.getFullYear() === lastMonth.getFullYear();
        });
    } else if (statusFilter === 'this-year') {
        filteredJobs = filteredJobs.filter(job => {
            if (!job.completedDate) return false;
            const jobDate = new Date(job.completedDate);
            return jobDate.getFullYear() === now.getFullYear();
        });
    }
    
    // Apply category filter
    const categoryFilter = document.getElementById('categoryFilter').value;
    if (categoryFilter !== 'all') {
        filteredJobs = filteredJobs.filter(job => job.category === categoryFilter);
    }
    
    // Apply search filter
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    if (searchInput) {
        filteredJobs = filteredJobs.filter(job => 
            job.location.toLowerCase().includes(searchInput) ||
            job.description.toLowerCase().includes(searchInput) ||
            job.title.toLowerCase().includes(searchInput)
        );
    }
    
    displayCompletedJobs(filteredJobs);
    calculateTotalEarnings(filteredJobs);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCompletedJobs();
    setupFilters();
});
