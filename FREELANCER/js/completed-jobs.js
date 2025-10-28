// ========================================
// COMPLETED JOBS FUNCTIONALITY
// Display and manage completed jobs
// ========================================

// Load completed jobs
function loadCompletedJobs() {
    const allJobs = JSON.parse(localStorage.getItem('jobRequests')) || [];
    
    // Filter only completed jobs
    const completedJobs = allJobs.filter(job => job.status === 'completed');
    
    displayCompletedJobs(completedJobs);
    calculateTotalEarnings(completedJobs);
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
}

// Create completed job card
function createCompletedJobCard(job) {
    const completedDate = job.completedDate ? new Date(job.completedDate).toLocaleDateString() : 'N/A';
    const earnings = job.estimatedBudget || 'N/A';
    
    return `
        <div class="job-card completed-job-card">
            <div class="job-header">
                <div>
                    <h3 class="job-title">${job.title}</h3>
                    <span class="job-category">${job.category}</span>
                </div>
                <span class="job-status status-completed">Completed</span>
            </div>
            
            <p class="job-description">${job.description}</p>
            
            <div class="job-meta">
                <div class="job-meta-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${job.location}</span>
                </div>
                <div class="job-meta-item">
                    <i class="fas fa-calendar-check"></i>
                    <span>Completed: ${completedDate}</span>
                </div>
                <div class="job-meta-item">
                    <i class="fas fa-dollar-sign"></i>
                    <span>Earned: ${earnings}</span>
                </div>
            </div>
            
            <div class="customer-info">
                <h4>Customer Details</h4>
                <div class="customer-detail">
                    <i class="fas fa-user"></i>
                    <span>${job.customerName}</span>
                </div>
                <div class="customer-detail">
                    <i class="fas fa-phone"></i>
                    <span>${job.customerPhone}</span>
                </div>
            </div>
            
            <div class="job-actions">
                <button class="btn-contact" onclick="viewDetails('${job.id}')">
                    <i class="fas fa-eye"></i> View Details
                </button>
            </div>
        </div>
    `;
}

// Calculate total earnings
function calculateTotalEarnings(jobs) {
    let total = 0;
    
    jobs.forEach(job => {
        if (job.estimatedBudget) {
            // Extract numeric value from budget string (e.g., "$150-300" -> 225)
            const matches = job.estimatedBudget.match(/\d+/g);
            if (matches && matches.length >= 2) {
                const min = parseInt(matches[0]);
                const max = parseInt(matches[1]);
                total += (min + max) / 2; // Use average
            } else if (matches && matches.length === 1) {
                total += parseInt(matches[0]);
            }
        }
    });
    
    const earningsElement = document.getElementById('totalEarnings');
    if (earningsElement) {
        earningsElement.textContent = `$${total.toFixed(2)}`;
    }
}

// View job details
function viewDetails(jobId) {
    const allJobs = JSON.parse(localStorage.getItem('jobRequests')) || [];
    const job = allJobs.find(j => j.id === jobId);
    
    if (job) {
        alert(`Job Details:\n\nTitle: ${job.title}\nCategory: ${job.category}\nLocation: ${job.location}\nCustomer: ${job.customerName}\nPhone: ${job.customerPhone}\nDescription: ${job.description}\n\nStatus: Completed\nEarnings: ${job.estimatedBudget}`);
    }
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
