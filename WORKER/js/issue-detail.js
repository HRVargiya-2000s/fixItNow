// ========================================
// WORKER - ISSUE DETAIL PAGE
// ========================================

let currentIssueId = null
let currentIssue = null
let workerUid = null

// Get issue ID from URL
function getIssueIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('id')
}

// Load and display issue details
async function loadIssueDetails() {
  currentIssueId = getIssueIdFromUrl()
  
  if (!currentIssueId) {
    showError('No issue ID provided')
    return
  }

  // Get worker UID
  workerUid = await getWorkerUid()
  if (!workerUid) {
    showError('Not authenticated')
    return
  }

  try {
    // Load issue from Firestore
    const issueDoc = await db.collection('issues').doc(currentIssueId).get()
    
    if (!issueDoc.exists) {
      showError('Issue not found')
      return
    }

    currentIssue = issueDoc.data()
    renderIssueDetails(issueDoc.id, currentIssue)
  } catch (error) {
    console.error('[issue-detail] Error loading issue:', error)
    showError('Failed to load issue details')
  }
}

// Get worker UID from various sources
async function getWorkerUid() {
  let uid = null

  try {
    if (window.workerAuthGuard && window.workerAuthGuard.getUser) {
      const u = window.workerAuthGuard.getUser()
      uid = (u && (u.uid || u.id || u._id || u.userId)) || uid
    }
  } catch (e) {}

  if (!uid) {
    try {
      if (window.workerAuth && window.workerAuth.getUser) {
        const u = window.workerAuth.getUser()
        uid = (u && (u.uid || u.id)) || uid
      }
    } catch (e) {}
  }

  if (!uid) {
    try {
      if (window.unifiedAuth && window.unifiedAuth.getUser) {
        const u = window.unifiedAuth.getUser()
        uid = (u && u.uid) || uid
      }
    } catch (e) {}
  }

  if (!uid) {
    try {
      const stored = localStorage.getItem('fixitnow_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        uid = parsed.uid || uid
      }
    } catch (e) {}
  }

  return uid
}

// Helper functions
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

function formatDate(ts) {
  try {
    if (!ts) return '-'
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleString()
  } catch (e) { return '-' }
}

// Render issue details
function renderIssueDetails(issueId, data) {
  const categoryIcon = getCategoryIcon(data.category)
  const categoryName = getCategoryDisplayName(data.category)
  const urgencyName = getUrgencyDisplayName(data.urgency)
  const budgetText = data.budget ? ('$' + (data.budget.min || data.budget.max || data.budget)) : 'Not specified'
  const statusRaw = (data.status || 'pending').toString()
  const statusKey = statusRaw.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')

  const imagesHtml = (data.images || []).map((url, idx) => `
    <div class="image-item" onclick="openImageModal('${url}')">
      <img src="${url}" alt="Image ${idx + 1}">
      <div class="image-overlay">
        <i class="fas fa-search-plus"></i>
      </div>
    </div>
  `).join('')

  const detailsHTML = `
    <!-- Title and Status Row -->
    <div class="detail-header">
      <div class="header-left">
        <span class="category-badge-icon" title="${categoryName}">
          <i class="fas fa-${categoryIcon}"></i>
        </span>
        <div>
          <h2>${data.title || 'Untitled'}</h2>
          <p class="status-line">
            <span class="status-badge status-${statusKey}">${statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1)}</span>
            <span class="urgency-label">${urgencyName}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Key Info Grid -->
    <div class="info-grid">
      <div class="info-item">
        <strong><i class="fas fa-th-large"></i> Category</strong>
        <p>${categoryName}</p>
      </div>
      <div class="info-item">
        <strong><i class="fas fa-exclamation-circle"></i> Urgency</strong>
        <p>${urgencyName}</p>
      </div>
      <div class="info-item">
        <strong><i class="fas fa-dollar-sign"></i> Budget</strong>
        <p>${budgetText}</p>
      </div>
      <div class="info-item">
        <strong><i class="fas fa-calendar-alt"></i> Posted</strong>
        <p>${formatDate(data.createdAt)}</p>
      </div>
    </div>

    <!-- Description Section -->
    <div class="section">
      <h3><i class="fas fa-align-left"></i> Description</h3>
      <p class="description-text">${data.description || 'No description provided'}</p>
    </div>

    <!-- Images Section -->
    ${imagesHtml ? `
    <div class="section">
      <h3><i class="fas fa-images"></i> Images (${data.images.length})</h3>
      <div class="images-grid">
        ${imagesHtml}
      </div>
    </div>
    ` : ''}

    <!-- Location Section -->
    <div class="section">
      <h3><i class="fas fa-map-marked-alt"></i> Location</h3>
      <div class="location-info">
        <p><strong>Address:</strong> ${data.location?.address || '-'}</p>
        <p><strong>City:</strong> ${data.location?.city || '-'}</p>
        <p><strong>State:</strong> ${data.location?.state || '-'}</p>
        <p><strong>Zip Code:</strong> ${data.location?.zipCode || '-'}</p>
        ${data.location?.coordinates ? `
          <p><strong>Coordinates:</strong> ${data.location.coordinates[1]}, ${data.location.coordinates[0]}</p>
        ` : ''}
      </div>
    </div>

    <!-- Preferred Time Section -->
    ${data.preferredTime ? `
    <div class="section">
      <h3><i class="fas fa-clock"></i> Preferred Time</h3>
      <p>${formatDate(data.preferredTime.date)}</p>
    </div>
    ` : ''}
  `

  const contentEl = document.getElementById('issueDetailsContent')
  if (contentEl) {
    contentEl.innerHTML = detailsHTML
  }

  // Update sidebar
  const contactEl = document.getElementById('contactPhone')
  if (contactEl) {
    contactEl.textContent = data.contactPhone || '-'
  }

  const budgetEl = document.getElementById('budgetDisplay')
  if (budgetEl) {
    budgetEl.innerHTML = `<p style="font-size: 1.5rem; font-weight: bold; color: var(--secondary-color);">${budgetText}</p>`
  }

  // Update subtitle
  const subtitleEl = document.getElementById('issueStatusSubtitle')
  if (subtitleEl) {
    subtitleEl.textContent = `${categoryName} • ${urgencyName}`
  }

  // Wire up buttons
  const acceptBtn = document.getElementById('acceptJobBtn')
  if (acceptBtn) {
    if (data.status === 'accepted') {
      acceptBtn.disabled = true
      acceptBtn.textContent = '✓ Already Accepted'
    } else {
      acceptBtn.addEventListener('click', () => acceptJob(issueId))
    }
  }

  const backBtn = document.getElementById('backBtn')
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'job-requests.html'
    })
  }
}

// Accept job
async function acceptJob(issueId) {
  if (!workerUid) {
    alert('Not authenticated')
    return
  }

  if (!confirm('Are you sure you want to accept this job?')) {
    return
  }

  const acceptBtn = document.getElementById('acceptJobBtn')
  acceptBtn.disabled = true
  acceptBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Accepting...'

  try {
    await db.collection('issues').doc(issueId).update({
      status: 'accepted',
      assignedWorker: workerUid,
      acceptedAt: firebase.firestore.FieldValue.serverTimestamp()
    })

    acceptBtn.innerHTML = '✓ Job Accepted'
    showNotification('Job accepted successfully!', 'success')

    setTimeout(() => {
      window.location.href = 'job-requests.html'
    }, 1500)
  } catch (error) {
    console.error('[issue-detail] Error accepting job:', error)
    acceptBtn.disabled = false
    acceptBtn.innerHTML = '<i class="fas fa-check-circle"></i> Accept Job'
    showNotification('Failed to accept job. Please try again.', 'error')
  }
}

// Show error message
function showError(message) {
  const contentEl = document.getElementById('issueDetailsContent')
  if (contentEl) {
    contentEl.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
        <i class="fas fa-exclamation-circle" style="font-size: 3rem; margin-bottom: 1rem; color: #ef4444;"></i>
        <p>${message}</p>
        <a href="job-requests.html" style="margin-top: 1rem; display: inline-block; color: var(--primary-color);">
          <i class="fas fa-arrow-left"></i> Back to Jobs
        </a>
      </div>
    `
  }
}

// Show notification
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
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    animation: slideInRight 0.3s ease;
    max-width: 400px;
  `

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease'
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  if (typeof db === 'undefined') {
    showError('Database not initialized')
    return
  }

  loadIssueDetails()
})

console.log('%c📄 Issue Detail Page Loaded', 'color: #2563eb; font-size: 16px; font-weight: bold;')
