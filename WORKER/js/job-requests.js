// Worker-side job requests viewer
// Loads issues matched to the current worker and displays them

let workerUid = null // Global variable to store worker UID for button handlers

async function waitForAuthGuard() {
  if (window.workerAuthGuard && typeof window.workerAuthGuard.init === 'function') {
    try {
      await window.workerAuthGuard.init()
    } catch (e) {
      console.warn('workerAuthGuard.init() error (ignored):', e)
    }
  }

  // If unified firebase auth is used, wait for it
  if (window.unifiedAuth && typeof window.unifiedAuth.waitForInit === 'function') {
    try { await window.unifiedAuth.waitForInit() } catch (e) {}
  }
}

// Wait for firebase-based workerAuth (if present) to initialize
async function waitForWorkerAuth() {
  if (window.workerAuth && typeof window.workerAuth.init === 'function') {
    try { await window.workerAuth.init() } catch (e) { console.warn('workerAuth.init() error:', e) }
  }
}

function formatDate(ts) {
  try {
    if (!ts) return ''
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleString()
  } catch (e) { return '' }
}

function getCategoryIcon(category) {
  const icons = {
    electrical: 'bolt',
    plumbing: 'faucet',
    vehicle: 'car',
    furniture: 'couch',
    appliance: 'blender',
    hvac: 'temperature-high',
  }
  return icons[category] || 'wrench'
}

function getCategoryDisplayName(category) {
  const names = {
    electrical: 'Electrical',
    plumbing: 'Plumbing',
    vehicle: 'Vehicle',
    furniture: 'Furniture',
    appliance: 'Appliance',
    hvac: 'HVAC',
  }
  return names[category] || category
}

function createIssueCard(issueId, data) {
  // CRITICAL: Do not render completed or submitted jobs
  const status = (data.status || 'pending').toLowerCase().trim()
  if (status === 'completed' || status === 'submitted') {
    console.log('[job-requests] Skipping card render for', status, 'job:', issueId)
    return '' // Return empty string, don't render card
  }

  const imagesHtml = (data.images || []).slice(0,2).map(url => `<img src="${url}" class="job-thumb" />`).join('')
  const desc = (data.description || '').slice(0,100)

  // normalize status and compute CSS class
  const statusRaw = (data.status || 'pending').toString();
  const statusKey = statusRaw.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const badgeText = statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1)

  // budget text
  const budgetText = data.budget ? ('$' + (data.budget.min || data.budget.max || data.budget)) : 'Not specified'
  
  // category badge with icon
  const categoryIcon = getCategoryIcon(data.category)
  const categoryName = getCategoryDisplayName(data.category)
  
  // urgency color
  const urgencyColor = {
    'high': '#ef4444',
    'emergency': '#991b1b',
    'medium': '#f59e0b',
    'low': '#10b981'
  }[data.urgency] || '#6b7280'

  return `
    <div class="job-card" data-id="${issueId}" data-category="${data.category || ''}" data-urgency="${data.urgency || ''}" data-status="${(data.status || 'pending').toLowerCase()}">
      <!-- Card Header: Category Badge + Title + Status -->
      <div class="job-card-top">
        <div class="job-card-left">
          <span class="category-badge-icon" title="${categoryName}">
            <i class="fas fa-${categoryIcon}"></i>
          </span>
          <div class="job-title-wrapper">
            <h3 class="job-title">${data.title || 'Untitled'}</h3>
            <div class="job-status-inline">
              <span class="job-status-badge ${'status-'+statusKey}">${badgeText}</span>
            </div>
          </div>
        </div>
        <div class="job-urgency-badge" style="border-left: 3px solid ${urgencyColor}">
          <i class="fas fa-exclamation-circle" style="color: ${urgencyColor}"></i>
          ${data.urgency || 'N/A'}
        </div>
      </div>

      <!-- Category, Budget, Date Meta -->
      <div class="job-meta-top">
        <div class="meta-item">
          <i class="fas fa-th-large"></i>
          <span>${categoryName}</span>
        </div>
        <div class="meta-item">
          <i class="fas fa-dollar-sign"></i>
          <span>${budgetText}</span>
        </div>
        <div class="meta-item">
          <i class="fas fa-calendar-alt"></i>
          <span>${formatDate(data.createdAt).split(' ')[0]}</span>
        </div>
      </div>

      <!-- Description -->
      <div class="job-content">
        <p class="job-description">${desc}${(data.description && data.description.length > 100) ? '...' : ''}</p>
      </div>

      <!-- Images Section -->
      ${imagesHtml ? `<div class="job-images">${imagesHtml}</div>` : ''}

      <!-- Location & Time -->
      <div class="job-meta-bottom">
        <div class="meta-item">
          <i class="fas fa-map-marker-alt"></i>
          <span>${data.location ? (data.location.address + ', ' + (data.location.city||'') ) : 'Location not provided'}</span>
        </div>
        <div class="meta-item">
          <i class="fas fa-clock"></i>
          <span>${formatDate(data.createdAt)}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="job-actions">
        <button class="btn-outline btn-view-issue" data-id="${issueId}" onclick="openIssueModal('${issueId}')">
          <i class="fas fa-eye"></i> VIEW DETAILS
        </button>
        ${data.status === 'accepted' || data.status === 'in-progress' ? `
        <button class="btn-submit btn-submit-work" data-id="${issueId}" onclick="openSubmitWorkModal('${issueId}')">
          <i class="fas fa-cloud-upload-alt"></i> SUBMIT WORK
        </button>
        ` : ''}
        ${data.status !== 'accepted' && data.status !== 'in-progress' ? `
        <button class="btn-accept btn-accept-large" data-id="${issueId}" ${data.status === 'accepted' ? 'disabled' : ''}>
          <i class="fas fa-check-circle"></i> ACCEPT JOB
        </button>
        ` : ''}
      </div>
    </div>
  `
}

async function loadJobRequests() {
  await waitForAuthGuard()

  // Determine the worker UID. Try multiple auth sources in sequence.
  let uid = null

  // Ensure auth systems had time to initialize
  await Promise.all([waitForAuthGuard(), waitForWorkerAuth()])

  // 1) workerAuthGuard (backend/api client)
  try {
    if (window.workerAuthGuard && window.workerAuthGuard.getUser) {
      const u = window.workerAuthGuard.getUser()
      uid = (u && (u.uid || u.id || u._id || u.userId)) || uid
      console.log('[job-requests] workerAuthGuard.getUser():', u)
    }
  } catch (e) { console.warn('workerAuthGuard.getUser() error:', e) }

  // 2) firebase wrapper (workerAuth)
  if (!uid) {
    try {
      if (window.workerAuth && window.workerAuth.getUser) {
        const u = window.workerAuth.getUser()
        uid = (u && (u.uid || u.id)) || uid
        console.log('[job-requests] workerAuth.getUser():', u)
      }
    } catch (e) { console.warn('workerAuth.getUser() error:', e) }
  }

  // 3) unifiedAuth (USER site style fallback)
  if (!uid) {
    try {
      if (window.unifiedAuth && window.unifiedAuth.getUser) {
        const u = window.unifiedAuth.getUser()
        uid = (u && u.uid) || uid
        console.log('[job-requests] unifiedAuth.getUser():', u)
      }
    } catch (e) { console.warn('unifiedAuth.getUser() error:', e) }
  }

  // 4) last-resort: localStorage (fixitnow_user) or apiClient token decode
  if (!uid) {
    try {
      const stored = localStorage.getItem('fixitnow_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        uid = parsed.uid || uid
        console.log('[job-requests] localStorage fixitnow_user:', parsed)
      }
    } catch (e) {}
  }

  // Assign to global variable for button handlers
  workerUid = uid
  console.log('[job-requests] Final workerUid:', workerUid)
  console.log('[job-requests] Current worker UID being used for matching:', workerUid)

  if (!workerUid) {
    console.warn('No worker UID available; cannot load matched job requests')
    const gridEl = document.getElementById('jobRequestsGrid')
    if (gridEl) gridEl.innerHTML = '<div style="padding:2rem;color:var(--text-secondary)">Please login to view job requests.</div>'
    return
  }

  // Query issues where matchedWorkers contains this worker UID
  try {
    // Query matched issues without server-side ordering (avoids requiring a composite index).
    // We'll sort results client-side by createdAt descending.
    const q = db.collection('issues').where('matchedWorkers', 'array-contains', workerUid)
    console.log('[job-requests] Setting up snapshot listener for workerUid:', workerUid)
    console.log('[job-requests] Query: issues where matchedWorkers array-contains:', workerUid)

    q.onSnapshot((snapshot) => {
      console.log('[job-requests] Snapshot received. Empty:', snapshot.empty, 'Size:', snapshot.size)
      
      if (snapshot.empty) {
        console.log('[job-requests] No matching job requests found')
        const grid = document.getElementById('jobRequestsGrid')
        if (grid) grid.innerHTML = `<div style="grid-column:1/-1;padding:2.5rem;text-align:center;color:var(--text-secondary)"><i class="fas fa-inbox" style="font-size:2.6rem;margin-bottom:10px"></i><div>No matching job requests at the moment</div></div>`
        const rc = document.getElementById('resultsCount')
        if (rc) rc.textContent = '0'
        return
      }

      // Collect docs and sort client-side by createdAt (newest first)
      const docs = []
      snapshot.forEach(doc => {
        const data = doc.data()
        docs.push({ id: doc.id, data: data })
        const status = (data.status || 'pending').toLowerCase()
        console.log('[job-requests] Issue document:', doc.id, '| Status:', status, '| Data:', data)
      })

      docs.sort((a, b) => {
        const ta = a.data.createdAt && a.data.createdAt.toDate ? a.data.createdAt.toDate().getTime() : (a.data.createdAt ? new Date(a.data.createdAt).getTime() : 0)
        const tb = b.data.createdAt && b.data.createdAt.toDate ? b.data.createdAt.toDate().getTime() : (b.data.createdAt ? new Date(b.data.createdAt).getTime() : 0)
        return tb - ta
      })

      // Filter out completed and submitted jobs - only show pending, accepted, in-progress
      const activeJobs = docs.filter(d => {
        const status = (d.data.status || 'pending').toLowerCase().trim()
        const isActive = status !== 'completed' && status !== 'submitted'
        if (!isActive) {
          console.log('[job-requests] Filtering out non-active job:', d.id, '| Status:', status)
        }
        return isActive
      })

      // Store all jobs for filtering
      allJobsData = activeJobs
      console.log('[job-requests] Stored', activeJobs.length, 'active jobs (excluding completed) out of', docs.length, 'total')

      // Render initial results (trigger applyFilters to respect current filter state)
      const categoryFilter = document.getElementById('categoryFilter')
      if (categoryFilter && categoryFilter.value === 'all' && 
          (!document.getElementById('urgencyFilter') || document.getElementById('urgencyFilter').value === 'all') &&
          (!document.getElementById('statusFilter') || document.getElementById('statusFilter').value === 'all') &&
          (!document.getElementById('searchInput') || document.getElementById('searchInput').value === '')) {
        // Initial render - no filters applied
        const grid = document.getElementById('jobRequestsGrid')
        if (grid) {
          const items = activeJobs.map(d => createIssueCard(d.id, d.data)).filter(item => item !== '')
          grid.innerHTML = items.join('\n')
          wireUpButtons()
          console.log('[job-requests] Rendered', items.length, 'job cards')
        }
      } else {
        // Filters already applied - re-apply them
        const categoryFilter = document.getElementById('categoryFilter')
        if (categoryFilter) categoryFilter.dispatchEvent(new Event('change'))
      }

      const rc = document.getElementById('resultsCount')
      if (rc) rc.textContent = String(activeJobs.length)
    }, (err) => {
      console.error('job-requests snapshot error:', err)
      const grid = document.getElementById('jobRequestsGrid')
      if (grid) grid.innerHTML = '<div style="padding:2rem;color:var(--text-secondary)">Unable to load requests (Realtime). Please refresh the page.</div>'
    })
  } catch (err) {
    console.error('Error loading matched issues:', err)
    document.getElementById('jobRequestsGrid').innerHTML = '<div style="padding:2rem;color:var(--text-secondary)">Unable to load requests.</div>'
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  // db and firebase are exposed by config.js
  if (typeof db === 'undefined') {
    console.error('Firestore `db` not found. Ensure config.js is loaded before this script.')
    return
  }

  loadJobRequests()
  setupFilters()
})

// ========================================
// FILTER FUNCTIONALITY
// ========================================

let allJobsData = [] // Store all loaded jobs for filtering

function setupFilters() {
  const categoryFilter = document.getElementById('categoryFilter')
  const urgencyFilter = document.getElementById('urgencyFilter')
  const statusFilter = document.getElementById('statusFilter')
  const searchInput = document.getElementById('searchInput')

  function applyFilters() {
    const selectedCategory = categoryFilter ? categoryFilter.value : 'all'
    const selectedUrgency = urgencyFilter ? urgencyFilter.value : 'all'
    const selectedStatus = statusFilter ? statusFilter.value : 'all'
    const searchTerm = (searchInput ? searchInput.value : '').toLowerCase()

    const filteredJobs = allJobsData.filter(job => {
      // ALWAYS exclude completed and submitted jobs
      const jobStatus = (job.data.status || 'pending').toLowerCase().trim()
      if (jobStatus === 'completed' || jobStatus === 'submitted') {
        console.log('[job-requests] Filter: Excluding', jobStatus, 'job:', job.id)
        return false
      }

      // Category filter
      if (selectedCategory !== 'all' && job.data.category !== selectedCategory) return false

      // Urgency filter
      if (selectedUrgency !== 'all' && job.data.urgency !== selectedUrgency) return false

      // Status filter
      const filterStatus = selectedStatus.toLowerCase()
      if (selectedStatus !== 'all' && jobStatus !== filterStatus) return false

      // Search filter (search in description, location, title)
      if (searchTerm) {
        const desc = (job.data.description || '').toLowerCase()
        const loc = (job.data.location?.city || '') + ' ' + (job.data.location?.address || '')
        const title = (job.data.title || '').toLowerCase()
        const searchable = desc + ' ' + loc.toLowerCase() + ' ' + title
        if (!searchable.includes(searchTerm)) return false
      }

      return true
    })

    // Render filtered results
    const grid = document.getElementById('jobRequestsGrid')
    if (!grid) return

    if (filteredJobs.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1;padding:2.5rem;text-align:center;color:var(--text-secondary)"><i class="fas fa-search" style="font-size:2.6rem;margin-bottom:10px"></i><div>No jobs match your filters</div></div>`
    } else {
      const items = filteredJobs.map(d => createIssueCard(d.id, d.data)).filter(item => item !== '')
      grid.innerHTML = items.join('\n')
      wireUpButtons()
    }

    const rc = document.getElementById('resultsCount')
    if (rc) rc.textContent = String(filteredJobs.length)
  }

  // Attach filter event listeners
  if (categoryFilter) categoryFilter.addEventListener('change', applyFilters)
  if (urgencyFilter) urgencyFilter.addEventListener('change', applyFilters)
  if (statusFilter) statusFilter.addEventListener('change', applyFilters)
  if (searchInput) searchInput.addEventListener('input', applyFilters)

  console.log('[job-requests] Filters initialized')
}

function wireUpButtons() {
  // Wire up accept buttons
  document.querySelectorAll('.btn-accept').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id')
      if (!confirm('Accept this job request?')) return
      try {
        await db.collection('issues').doc(id).update({ status: 'accepted', assignedWorker: workerUid, acceptedAt: firebase.firestore.FieldValue.serverTimestamp() })
        btn.disabled = true
        btn.textContent = 'Accepted'
        console.log('[job-requests] Job accepted:', id)
        // Refresh to update UI
        setTimeout(() => location.reload(), 500)
      } catch (err) {
        console.error('Error accepting job:', err)
        alert('Failed to accept job. See console for details.')
      }
    }
  })
}

// ========================================
// ISSUE MODAL FUNCTIONS
// ========================================

function getCategoryIcon(category) {
  const icons = {
    electrical: 'bolt',
    plumbing: 'faucet',
    vehicle: 'car',
    furniture: 'couch',
    appliance: 'blender',
    hvac: 'temperature-high',
  }
  return icons[category] || 'wrench'
}

function getCategoryDisplayName(category) {
  const names = {
    electrical: 'Electrical',
    plumbing: 'Plumbing',
    vehicle: 'Vehicle',
    furniture: 'Furniture',
    appliance: 'Appliance',
    hvac: 'HVAC',
  }
  return names[category] || category
}

function getUrgencyDisplayName(urgency) {
  const names = {
    low: 'Low Priority',
    medium: 'Medium Priority',
    high: 'High Priority',
    emergency: 'Emergency',
  }
  return names[urgency] || urgency
}

function formatDateDetail(ts) {
  try {
    if (!ts) return '-'
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleString()
  } catch (e) { return '-' }
}

async function openIssueModal(issueId) {
  try {
    // Fetch issue details from Firestore
    const issueDoc = await db.collection('issues').doc(issueId).get()
    
    if (!issueDoc.exists) {
      alert('Issue not found')
      return
    }

    const data = issueDoc.data()
    const categoryIcon = getCategoryIcon(data.category)
    const categoryName = getCategoryDisplayName(data.category)
    const urgencyName = getUrgencyDisplayName(data.urgency)
    const budgetText = data.budget ? ('$' + (data.budget.min || data.budget.max || data.budget)) : 'Not specified'
    const statusRaw = (data.status || 'pending').toString()
    const statusKey = statusRaw.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const imagesHtml = (data.images || []).map((url, idx) => `
      <img src="${url}" alt="Image ${idx + 1}" class="modal-image" onclick="viewFullImage('${url}')">
    `).join('')

    const modalHTML = `
      <div class="issue-modal-overlay" onclick="closeIssueModal(event)">
        <div class="issue-modal-content" onclick="event.stopPropagation()">
          <!-- Close Button -->
          <button class="modal-close-btn" onclick="closeIssueModal()">
            <i class="fas fa-times"></i>
          </button>

          <!-- Modal Header -->
          <div class="modal-header">
            <span class="category-badge-icon modal-icon" title="${categoryName}">
              <i class="fas fa-${categoryIcon}"></i>
            </span>
            <div class="modal-header-content">
              <h2>${data.title || 'Untitled'}</h2>
              <div class="modal-status-line">
                <span class="status-badge status-${statusKey}">${statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1)}</span>
                <span class="urgency-badge-modal">${urgencyName}</span>
              </div>
            </div>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <!-- Info Grid -->
            <div class="modal-info-grid">
              <div class="modal-info-item">
                <strong><i class="fas fa-th-large"></i> Category</strong>
                <p>${categoryName}</p>
              </div>
              <div class="modal-info-item">
                <strong><i class="fas fa-exclamation-circle"></i> Urgency</strong>
                <p>${urgencyName}</p>
              </div>
              <div class="modal-info-item">
                <strong><i class="fas fa-dollar-sign"></i> Budget</strong>
                <p>${budgetText}</p>
              </div>
              <div class="modal-info-item">
                <strong><i class="fas fa-calendar-alt"></i> Posted</strong>
                <p>${formatDateDetail(data.createdAt).split(' ')[0]}</p>
              </div>
            </div>

            <!-- Description -->
            <div class="modal-section">
              <h3><i class="fas fa-align-left"></i> Description</h3>
              <p class="modal-description">${data.description || 'No description provided'}</p>
            </div>

            <!-- Images -->
            ${imagesHtml ? `
            <div class="modal-section">
              <h3><i class="fas fa-images"></i> Images (${data.images.length})</h3>
              <div class="modal-images-grid">
                ${imagesHtml}
              </div>
            </div>
            ` : ''}

            <!-- Location -->
            <div class="modal-section">
              <h3><i class="fas fa-map-marked-alt"></i> Location</h3>
              <div class="modal-location-info">
                <p><i class="fas fa-map-marker-alt"></i> <strong>Address:</strong> ${data.location?.address || '-'}</p>
                <p><i class="fas fa-city"></i> <strong>City:</strong> ${data.location?.city || '-'}</p>
                <p><i class="fas fa-flag"></i> <strong>State:</strong> ${data.location?.state || '-'}</p>
                <p><i class="fas fa-hashtag"></i> <strong>Zip:</strong> ${data.location?.zipCode || '-'}</p>
              </div>
            </div>

            <!-- Contact Info -->
            <div class="modal-section">
              <h3><i class="fas fa-phone"></i> Contact</h3>
              <p class="modal-contact">${data.contactPhone || '-'}</p>
            </div>
          </div>

          <!-- Modal Footer with Actions -->
          <div class="modal-footer">
            <button class="btn-secondary-modal" onclick="closeIssueModal()">
              <i class="fas fa-times"></i> Close
            </button>
            <button class="btn-primary-modal" onclick="acceptJobFromModal('${issueId}', ${data.status === 'accepted' ? 'true' : 'false'})" ${data.status === 'accepted' ? 'disabled' : ''}>
              <i class="fas fa-check-circle"></i> ${data.status === 'accepted' ? 'Already Accepted' : 'Accept Job'}
            </button>
          </div>
        </div>
      </div>
    `

    // Create modal container if it doesn't exist
    let modalContainer = document.getElementById('issueModalContainer')
    if (!modalContainer) {
      modalContainer = document.createElement('div')
      modalContainer.id = 'issueModalContainer'
      document.body.appendChild(modalContainer)
    }

    modalContainer.innerHTML = modalHTML
    modalContainer.style.display = 'block'

    // Add animation
    const modal = modalContainer.querySelector('.issue-modal-overlay')
    setTimeout(() => {
      modal.classList.add('active')
    }, 10)
  } catch (error) {
    console.error('[job-requests] Error opening modal:', error)
    alert('Failed to load issue details')
  }
}

function closeIssueModal(event) {
  // Allow closing by clicking overlay or close button
  if (event && event.target.id !== 'issueModalContainer') return
  
  const modalContainer = document.getElementById('issueModalContainer')
  if (modalContainer) {
    const modal = modalContainer.querySelector('.issue-modal-overlay')
    modal.classList.remove('active')
    setTimeout(() => {
      modalContainer.style.display = 'none'
    }, 300)
  }
}

function viewFullImage(url) {
  // Open image in new tab
  window.open(url, '_blank')
}

async function openSubmitWorkModal(issueId) {
  try {
    // Fetch issue details
    const issueDoc = await db.collection('issues').doc(issueId).get()
    if (!issueDoc.exists) {
      alert('Issue not found')
      return
    }

    const data = issueDoc.data()
    
    // Create modal for work submission
    const submitModalHTML = `
      <div class="issue-modal-overlay" onclick="closeSubmitWorkModal(event)">
        <div class="issue-modal-content" onclick="event.stopPropagation()">
          <button class="modal-close-btn" onclick="closeSubmitWorkModal()">
            <i class="fas fa-times"></i>
          </button>

          <div class="submit-modal-content">
            <h2 class="submit-modal-title">Submit Work Completion</h2>
            <p class="submit-modal-subtitle">Upload photos of completed work</p>

            <div class="upload-area" id="uploadArea">
              <input type="file" id="photoInput" multiple accept="image/*" style="display:none;">
              <i class="fas fa-cloud-upload-alt" style="font-size:2.5rem;margin-bottom:1rem;color:var(--primary-color)"></i>
              <p>Drag photos here or click to browse</p>
              <small>Maximum 5 images, up to 5MB each</small>
            </div>

            <div id="uploadedPhotos" style="display:flex;flex-wrap:wrap;gap:0.75rem;margin-top:1.5rem;"></div>

            <div class="submit-modal-footer">
              <button class="btn-cancel-submit" onclick="closeSubmitWorkModal()">
                <i class="fas fa-times"></i> Cancel
              </button>
              <button class="btn-submit-work-confirm" id="submitBtn" disabled>
                <i class="fas fa-check"></i> Submit Work
              </button>
            </div>
          </div>
        </div>
      </div>
    `

    // Create modal container
    let modalContainer = document.getElementById('submitWorkModalContainer')
    if (!modalContainer) {
      modalContainer = document.createElement('div')
      modalContainer.id = 'submitWorkModalContainer'
      document.body.appendChild(modalContainer)
    }

    modalContainer.innerHTML = submitModalHTML
    modalContainer.style.display = 'block'

    // Add animation
    const modal = modalContainer.querySelector('.issue-modal-overlay')
    setTimeout(() => {
      modal.classList.add('active')
    }, 10)

    // Setup file upload
    const uploadArea = document.getElementById('uploadArea')
    const photoInput = document.getElementById('photoInput')
    const uploadedPhotos = document.getElementById('uploadedPhotos')
    const submitBtn = document.getElementById('submitBtn')
    let selectedFiles = []

    uploadArea.onclick = () => photoInput.click()
    uploadArea.ondragover = (e) => {
      e.preventDefault()
      uploadArea.style.background = 'rgba(37, 99, 235, 0.1)'
    }
    uploadArea.ondragleave = () => {
      uploadArea.style.background = 'transparent'
    }
    uploadArea.ondrop = (e) => {
      e.preventDefault()
      uploadArea.style.background = 'transparent'
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
      if (files.length > 0) handleFileSelection(files)
    }

    photoInput.onchange = (e) => {
      const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'))
      if (files.length > 0) handleFileSelection(files)
    }

    function handleFileSelection(files) {
      selectedFiles = files.slice(0, 5)
      uploadedPhotos.innerHTML = selectedFiles.map((file, idx) => `
        <div style="position:relative;width:100px;height:100px;border-radius:8px;overflow:hidden;border:2px solid var(--border-color);">
          <img src="${URL.createObjectURL(file)}" style="width:100%;height:100%;object-fit:cover;">
          <button onclick="removePhoto(${idx})" style="position:absolute;top:4px;right:4px;background:#ef4444;color:white;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;display:flex;align-items:center;justify-content:center;">
            <i class="fas fa-times" style="font-size:0.8rem;"></i>
          </button>
        </div>
      `).join('')
      submitBtn.disabled = selectedFiles.length === 0
    }

    window.removePhoto = (idx) => {
      selectedFiles.splice(idx, 1)
      handleFileSelection(selectedFiles)
    }

    submitBtn.onclick = async () => {
      if (selectedFiles.length === 0) {
        alert('Please select at least one photo')
        return
      }

      submitBtn.disabled = true
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...'

      try {
        // Upload photos to Cloudinary or Firebase Storage
        const photoUrls = []
        console.log(`[job-requests] Starting upload of ${selectedFiles.length} file(s)`)
        
        for (const file of selectedFiles) {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('upload_preset', 'ml_default')

          console.log(`[job-requests] Uploading ${file.name}...`)
          const response = await fetch('https://api.cloudinary.com/v1_1/dqs1kmwwy/image/upload', {
            method: 'POST',
            body: formData
          })
          
          if (!response.ok) {
            const error = await response.json()
            console.error(`[job-requests] Upload failed for ${file.name}:`, error)
            throw new Error(`Upload failed: ${error.error?.message || 'Unknown error'}`)
          }
          
          const result = await response.json()
          console.log(`[job-requests] Upload successful for ${file.name}:`, result.secure_url)
          if (result.secure_url) photoUrls.push(result.secure_url)
        }

        console.log(`[job-requests] All uploads complete. Got ${photoUrls.length} URLs:`, photoUrls)

        // Update issue with completion photos and status
        console.log(`[job-requests] Updating issue ${issueId} with photos...`)
        await db.collection('issues').doc(issueId).update({
          completionPhotos: photoUrls,
          status: 'submitted',
          submittedAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        
        console.log(`[job-requests] Issue ${issueId} updated successfully!`)

        showNotification('Work submitted successfully!', 'success')
        closeSubmitWorkModal()
        setTimeout(() => location.reload(), 1000)
      } catch (error) {
        console.error('Error submitting work:', error)
        submitBtn.disabled = false
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Submit Work'
        showNotification('Failed to submit work. Please try again.', 'error')
      }
    }
  } catch (error) {
    console.error('[job-requests] Error opening submit modal:', error)
    alert('Failed to open submission form')
  }
}

function closeSubmitWorkModal(event) {
  if (event && event.target.id !== 'submitWorkModalContainer') return
  
  const modalContainer = document.getElementById('submitWorkModalContainer')
  if (modalContainer) {
    const modal = modalContainer.querySelector('.issue-modal-overlay')
    modal.classList.remove('active')
    setTimeout(() => {
      modalContainer.style.display = 'none'
    }, 300)
  }
}

function viewFullImage(url) {
  // Open image in new tab
  window.open(url, '_blank')
}

async function acceptJobFromModal(issueId, alreadyAccepted) {
  if (alreadyAccepted) return

  if (!confirm('Accept this job?')) return

  const btn = event.target
  btn.disabled = true
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Accepting...'

  try {
    await db.collection('issues').doc(issueId).update({
      status: 'accepted',
      assignedWorker: workerUid,
      acceptedAt: firebase.firestore.FieldValue.serverTimestamp()
    })

    btn.innerHTML = '<i class="fas fa-check-circle"></i> Accepted'
    showNotification('Job accepted successfully!', 'success')

    setTimeout(() => {
      closeIssueModal()
      location.reload()
    }, 1000)
  } catch (error) {
    console.error('[job-requests] Error accepting job:', error)
    btn.disabled = false
    btn.innerHTML = '<i class="fas fa-check-circle"></i> Accept Job'
    showNotification('Failed to accept job', 'error')
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div')
  notification.className = `notification notification-${type}`
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10001;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  `

  document.body.appendChild(notification)
  setTimeout(() => notification.remove(), 3000)
}
