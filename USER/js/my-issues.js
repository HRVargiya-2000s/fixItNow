// ========================================
// MY ISSUES PAGE FUNCTIONALITY
// ========================================

// Load issues from localStorage
let allIssues = []
let currentStatusFilter = "all"
let currentCategoryFilter = "all"
let currentUrgencyFilter = "all"

// Initialize page when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  console.log("[v0] My Issues page initialized")
  setupFilters()

  try {
    // Wait for unifiedAuth if available
    if (window.unifiedAuth && typeof window.unifiedAuth.waitForInit === 'function') {
      await window.unifiedAuth.waitForInit()
    }

    const user = (window.unifiedAuth && window.unifiedAuth.getUser && window.unifiedAuth.getUser()) || null
    const uid = user && user.uid ? user.uid : (localStorage.getItem('fixitnow_user') ? JSON.parse(localStorage.getItem('fixitnow_user')).uid : null)

    if (!uid) {
      console.warn('[v0] No user logged in for My Issues')
      loadIssues() // fallback to localStorage
      return
    }

    // Listen to Firestore issues for this user
    db.collection('issues').where('userId','==',uid).onSnapshot(snapshot => {
      const issues = []
      snapshot.forEach(doc => {
        const d = doc.data()
        issues.push({ id: doc.id, ...d })
      })

      // normalize and set
      allIssues = issues.map(i => normalizeIssue(i))
      updateStats()
      displayIssues()
    }, err => {
      console.error('My issues listener error:', err)
      loadIssues()
    })
  } catch (e) {
    console.warn('[v0] loadIssues failed:', e)
    loadIssues()
  }
})

// Initialize Firebase-backed real-time load for user's issues
async function initializeFirebaseLoad() {
  try {
    // wait for unifiedAuth
    if (window.unifiedAuth && typeof window.unifiedAuth.waitForInit === 'function') {
      await window.unifiedAuth.waitForInit()
    }

    const user = (window.unifiedAuth && window.unifiedAuth.getUser && window.unifiedAuth.getUser()) || null
    const uid = user && user.uid ? user.uid : (localStorage.getItem('fixitnow_user') ? JSON.parse(localStorage.getItem('fixitnow_user')).uid : null)

    if (!uid) {
      console.warn('[v0] No user logged in for My Issues')
      loadIssues() // fallback to localStorage
      return
    }

    // Listen to Firestore issues for this user
    db.collection('issues').where('userId','==',uid).onSnapshot(snapshot => {
      const issues = []
      snapshot.forEach(doc => {
        const d = doc.data()
        issues.push({ id: doc.id, ...d })
      })

      // normalize and set
      allIssues = issues.map(i => normalizeIssue(i))
      updateStats()
      displayIssues()
    }, err => {
      console.error('My issues listener error:', err)
      loadIssues()
    })
  } catch (e) {
    console.warn('[v0] loadIssues failed:', e)
    loadIssues()
  }
}

// This function will be called by auth-check.js after auth is verified
function loadIssues() {
  console.log("[v0] Loading issues...")

  // Get issues from localStorage
  const storedIssues = localStorage.getItem("reportedIssues")
  const parsed = storedIssues ? JSON.parse(storedIssues) : null

  // Normalize issue shapes so both older sample issues and new submissions are displayed
  if (parsed && Array.isArray(parsed)) {
    allIssues = parsed.map((iss) => normalizeIssue(iss))
  } else {
    allIssues = getSampleIssues()
  }

  console.log("[v0] Loaded", allIssues.length, "issues")

  updateStats()
  displayIssues()
  setupFilters()
}

function setupFilters() {
  const statusFilter = document.getElementById("statusFilter")
  const categoryFilter = document.getElementById("categoryFilter")
  const urgencyFilter = document.getElementById("urgencyFilter")

  if (statusFilter) {
    statusFilter.addEventListener("change", (e) => {
      currentStatusFilter = e.target.value
      displayIssues()
    })
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", (e) => {
      currentCategoryFilter = e.target.value
      displayIssues()
    })
  }

  if (urgencyFilter) {
    urgencyFilter.addEventListener("change", (e) => {
      currentUrgencyFilter = e.target.value
      displayIssues()
    })
  }
}

function getSampleIssues() {
  // Sample data for demonstration
  return [
    {
      id: Date.now() - 10000,
      category: "plumbing",
      issueTitle: "Leaking Kitchen Faucet",
      description: "Water is dripping from the kitchen faucet continuously. Started yesterday.",
      urgency: "medium",
      status: "in-progress",
      budget: 150,
      address: "123 Main Street, New York, NY 10001",
      contactPhone: "+1 (555) 123-4567",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: Date.now() - 20000,
      category: "electrical",
      issueTitle: "Bedroom Light Not Working",
      description: "Light fixture in master bedroom suddenly stopped working.",
      urgency: "low",
      status: "pending",
      budget: 100,
      address: "123 Main Street, New York, NY 10001",
      contactPhone: "+1 (555) 123-4567",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: Date.now() - 30000,
      category: "vehicle",
      issueTitle: "Car Oil Change Needed",
      description: "Regular maintenance - oil change and filter replacement required.",
      urgency: "low",
      status: "completed",
      budget: 80,
      address: "123 Main Street, New York, NY 10001",
      contactPhone: "+1 (555) 123-4567",
      createdAt: new Date(Date.now() - 259200000).toISOString(),
    },
  ]
}

function updateStats() {
  const total = allIssues.length
  const pending = allIssues.filter((i) => i.status === "pending").length
  const progress = allIssues.filter((i) => i.status === "in-progress" || i.status === "accepted").length
  const completed = allIssues.filter((i) => i.status === "completed").length

  document.getElementById("totalCount").textContent = total
  document.getElementById("pendingCount").textContent = pending
  document.getElementById("progressCount").textContent = progress
  document.getElementById("completedCount").textContent = completed
}

// Normalize different shapes of stored issues into the shape expected by this page
function normalizeIssue(issue) {
  // If already normalized (has issueTitle), return as-is
  if (issue.issueTitle) return issue

  const normalized = {
    id: issue.id || Date.now(),
    category: issue.category || issue.type || "general",
    issueTitle: issue.issueTitle || issue.title || issue.name || "Untitled Issue",
    description: issue.description || issue.desc || "",
    urgency: issue.urgency || (issue.priority ? issue.priority : "low"),
    status: issue.status || (issue.state ? issue.state : "pending"),
    budget:
      typeof issue.budget === "number"
        ? issue.budget
        : issue.budget && issue.budget.min
        ? issue.budget.min
        : issue.budget && issue.budget.max
        ? issue.budget.max
        : undefined,
    contactPhone: issue.contactPhone || issue.phone || "",
    createdAt: issue.createdAt || new Date().toISOString(),
    images: issue.images || issue.imageUrls || issue.uploadedImages || [],
  }

  // Build an address string from possible locations
  if (issue.address) {
    normalized.address = issue.address
  } else if (issue.location) {
    const loc = issue.location
    const addrParts = []
    if (loc.address) addrParts.push(loc.address)
    if (loc.city) addrParts.push(loc.city)
    if (loc.state) addrParts.push(loc.state)
    if (loc.zipCode) addrParts.push(loc.zipCode)
    normalized.address = addrParts.join(", ")
  } else {
    normalized.address = ""
  }

  return normalized
}

function displayIssues() {
  const grid = document.getElementById("issuesGrid")
  const emptyState = document.getElementById("emptyState")

  const filtered = allIssues.filter((issue) => {
    const matchesStatus = currentStatusFilter === "all" || issue.status === currentStatusFilter
    const matchesCategory = currentCategoryFilter === "all" || issue.category === currentCategoryFilter
    const matchesUrgency = currentUrgencyFilter === "all" || issue.urgency === currentUrgencyFilter
    return matchesStatus && matchesCategory && matchesUrgency
  })

  if (filtered.length === 0) {
    grid.style.display = "none"
    emptyState.style.display = "flex"
    return
  }

  grid.style.display = "grid"
  emptyState.style.display = "none"

  grid.innerHTML = filtered.map((issue) => createIssueCard(issue)).join("")
}

function createIssueCard(issue) {
  const categoryIcons = {
    electrical: "fa-bolt",
    plumbing: "fa-faucet",
    vehicle: "fa-car",
    furniture: "fa-couch",
    appliance: "fa-blender",
    hvac: "fa-fan",
  }

  const urgencyLabels = {
    low: "Low Priority",
    medium: "Medium Priority",
    high: "High Priority",
    emergency: "Emergency",
  }

  const statusLabels = {
    pending: "Pending",
    accepted: "Accepted",
    "in-progress": "In Progress",
    submitted: "Submitted",
    completed: "Completed",
  }

  const date = new Date(issue.createdAt)
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: 'long',
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Get status label with fallback
  const statusLabel = statusLabels[issue.status] || (issue.status ? issue.status.charAt(0).toUpperCase() + issue.status.slice(1) : 'Pending')

  return `
    <div class="issue-card">
      <div class="issue-header">
        <div class="issue-icon">
          <i class="fas ${categoryIcons[issue.category] || "fa-tools"}"></i>
        </div>
        <div class="issue-title-section">
          <h3 class="issue-title">${issue.issueTitle}</h3>
          <span class="issue-id">#${issue.category.toUpperCase()}</span>
        </div>
      </div>

      <span class="status-badge status-${issue.status || 'pending'}">
        ${statusLabel}
      </span>

      <p class="issue-description">${issue.description}</p>
      
      <div class="issue-details">
        <div class="detail-item">
          <i class="fas fa-calendar"></i>
          <span>${formattedDate}</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-exclamation-circle"></i>
          <span>${urgencyLabels[issue.urgency]}</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-dollar-sign"></i>
          <span>$${issue.budget || "Not set"}</span>
        </div>
        ${issue.images && issue.images.length ? `
        <div class="detail-item">
          <i class="fas fa-images"></i>
          <span>${issue.images.length} image(s)</span>
        </div>
        ` : ''}
      </div>

      ${issue.images && issue.images.length ? `
      <div class="issue-images-preview">
        ${issue.images.slice(0, 3).map(img => `
          <img src="${img}" alt="Issue preview" class="issue-thumbnail">
        `).join('')}
        ${issue.images.length > 3 ? `<div class="image-count-badge">+${issue.images.length - 3}</div>` : ''}
      </div>
      ` : ''}

      <div class="issue-actions">
        <button class="action-button btn-view" onclick="viewIssue('${issue.id}')">
          <i class="fas fa-eye"></i> View
        </button>
      </div>
    </div>
  `
}

// Review submission (user side) - approve or reject submitted work
async function reviewSubmission(issueId) {
  try {
    const doc = await db.collection('issues').doc(issueId).get()
    if (!doc.exists) return alert('Issue not found')
    const data = doc.data()

    // Build a simple modal to display completion photos and Approve/Reject buttons
    const photos = (data.completionPhotos || [])
    
    // DEBUG: Log what we're getting from Firestore
    console.log('Issue Data Retrieved:', {
      id: issueId,
      status: data.status,
      completionPhotos: photos,
      hasCompletionPhotos: !!data.completionPhotos,
      photoCount: photos.length,
      submittedAt: data.submittedAt,
      submittedByWorker: data.submittedByWorker,
      fullData: data
    })
    
    if (!photos || photos.length === 0) {
      console.error('No photos found. Full issue data:', data)
      return alert(`No completion photos submitted yet.\n\nDebug Info:\nStatus: ${data.status}\nSubmittedAt: ${data.submittedAt ? 'Yes' : 'No'}\nCompletionPhotos field exists: ${!!data.completionPhotos}`)
    }

    // Create modal overlay
    const overlay = document.createElement('div')
    overlay.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:10000;backdrop-filter:blur(4px);'

    const modal = document.createElement('div')
    modal.style.cssText = 'background:var(--bg-card);color:var(--text-primary);padding:2rem;border-radius:12px;max-width:900px;width:90%;max-height:90%;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);'

    const title = document.createElement('h3')
    title.textContent = 'Worker Submission - Review Photos'
    title.style.cssText = 'font-size:1.5rem;font-weight:700;margin-bottom:1.5rem;color:var(--text-primary);'
    modal.appendChild(title)

    const photosContainer = document.createElement('div')
    photosContainer.style.cssText = 'display:flex;flex-wrap:wrap;gap:12px;margin:1.5rem 0;justify-content:flex-start;'
    photos.forEach(u => {
      const img = document.createElement('img')
      img.src = u
      img.style.cssText = 'width:220px;height:160px;object-fit:cover;border-radius:8px;border:1px solid var(--border-color);cursor:pointer;transition:transform 0.2s ease;'
      img.onmouseover = () => img.style.transform = 'scale(1.05)'
      img.onmouseout = () => img.style.transform = 'scale(1)'
      photosContainer.appendChild(img)
    })
    modal.appendChild(photosContainer)

    const btnRow = document.createElement('div')
    btnRow.style.cssText = 'display:flex;gap:12px;margin-top:1.5rem;justify-content:flex-end;padding-top:1.5rem;border-top:1px solid var(--border-color);'

    const approveBtn = document.createElement('button')
    approveBtn.className = 'btn-primary'
    approveBtn.textContent = 'Approve'

    const rejectBtn = document.createElement('button')
    rejectBtn.className = 'btn-secondary'
    rejectBtn.textContent = 'Reject'

    const closeBtn = document.createElement('button')
    closeBtn.className = 'btn-danger'
    closeBtn.textContent = 'Close'

    btnRow.appendChild(closeBtn)
    btnRow.appendChild(rejectBtn)
    btnRow.appendChild(approveBtn)
    modal.appendChild(btnRow)

    overlay.appendChild(modal)
    document.body.appendChild(overlay)

    closeBtn.onclick = () => overlay.remove()

    rejectBtn.onclick = async () => {
      if (!confirm('Reject submission and ask worker to resubmit?')) return
      try {
        await db.collection('issues').doc(issueId).update({ status: 'in-progress' })
        if (data.assignedWorker) {
          await db.collection('workers').doc(data.assignedWorker).collection('notifications').add({ issueId, message: 'User rejected the submission. Please review and resubmit.', read:false, createdAt: firebase.firestore.FieldValue.serverTimestamp() })
        }
        alert('Submission rejected and worker notified.')
        overlay.remove()
      } catch (err) {
        console.error('Reject error', err)
        alert('Failed to reject submission. See console.')
      }
    }

    approveBtn.onclick = async () => {
      if (!confirm('Approve this submission as completed?')) return
      try {
        await db.collection('issues').doc(issueId).update({ status: 'completed', completedAt: firebase.firestore.FieldValue.serverTimestamp() })
        if (data.assignedWorker) {
          await db.collection('workers').doc(data.assignedWorker).collection('notifications').add({ issueId, message: 'Your submitted work was approved by the user.', read:false, createdAt: firebase.firestore.FieldValue.serverTimestamp() })
        }
        alert('Work approved. Thank you!')
        overlay.remove()
      } catch (err) {
        console.error('Approve error', err)
        alert('Failed to approve. See console for details.')
      }
    }
  } catch (err) {
    console.error('Review submission error', err)
    alert('Failed to review submission. See console for details.')
  }
}

function viewIssue(id) {
  const issue = allIssues.find((i) => i.id === id)
  if (!issue) return

  const categoryIcons = {
    electrical: "fa-bolt",
    plumbing: "fa-faucet",
    vehicle: "fa-car",
    furniture: "fa-couch",
    appliance: "fa-blender",
    hvac: "fa-fan",
  }

  const statusLabels = {
    pending: "Pending",
    accepted: "Accepted",
    "in-progress": "In Progress",
    completed: "Completed",
  }

  const urgencyLabels = {
    low: "Low Priority",
    medium: "Medium Priority",
    high: "High Priority",
    emergency: "Emergency",
  }

  const date = new Date(issue.createdAt)
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: 'long',
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Get status label with fallback
  const statusLabel = statusLabels[issue.status] || (issue.status ? issue.status.charAt(0).toUpperCase() + issue.status.slice(1) : 'Pending')

  // Create modal HTML
  const modalHtml = `
    <div class="modal-overlay" id="issueModal" onclick="if(event.target.id === 'issueModal') closeIssueModal()">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title-section">
            <div class="modal-icon">
              <i class="fas ${categoryIcons[issue.category] || "fa-tools"}"></i>
            </div>
            <div>
              <h2 class="modal-title">${issue.issueTitle}</h2>
              <span class="modal-id">#${issue.id.toString().slice(-6)}</span>
            </div>
          </div>
          <button class="modal-close" onclick="closeIssueModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <!-- Quick Status Section -->
          <div class="modal-quick-info">
            <div class="quick-info-item">
              <span class="info-label">Status</span>
              <span class="status-badge status-${issue.status || 'pending'}">
                ${statusLabel}
              </span>
            </div>
            <div class="quick-info-item">
              <span class="info-label">Priority</span>
              <span class="priority-badge">${urgencyLabels[issue.urgency]}</span>
            </div>
            <div class="quick-info-item">
              <span class="info-label">Budget</span>
              <span class="budget-value">$${issue.budget || "Not set"}</span>
            </div>
          </div>

          <!-- Overview Section -->
          <div class="detail-section">
            <h3 class="section-title">
              <i class="fas fa-list"></i> Overview
            </h3>
            <div class="overview-grid">
              <div class="overview-item">
                <span class="item-label">Category</span>
                <span class="item-value">${issue.category.charAt(0).toUpperCase() + issue.category.slice(1)}</span>
              </div>
              <div class="overview-item">
                <span class="item-label">Reported On</span>
                <span class="item-value">${formattedDate}</span>
              </div>
            </div>
          </div>

          <!-- Description Section -->
          <div class="detail-section">
            <h3 class="section-title">
              <i class="fas fa-align-left"></i> Description
            </h3>
            <div class="description-box">
              ${issue.description}
            </div>
          </div>

          <!-- Location & Contact Section -->
          <div class="detail-section">
            <h3 class="section-title">
              <i class="fas fa-map-marker-alt"></i> Location & Contact
            </h3>
            <div class="contact-grid">
              <div class="contact-item">
                <i class="fas fa-map-pin"></i>
                <div>
                  <span class="contact-label">Address</span>
                  <span class="contact-value">${issue.address}</span>
                </div>
              </div>
              <div class="contact-item">
                <i class="fas fa-phone"></i>
                <div>
                  <span class="contact-label">Phone</span>
                  <span class="contact-value">${issue.contactPhone}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Attachments Section -->
          ${issue.images && issue.images.length ? `
          <div class="detail-section">
            <h3 class="section-title">
              <i class="fas fa-images"></i> Attachments (${issue.images.length} image${issue.images.length > 1 ? 's' : ''})
            </h3>
            <div class="attachments-grid">
              ${issue.images.map(img => `
                <div class="attachment-item">
                  <img src="${img}" alt="Issue image" onclick="openImageFullscreen('${img}')">
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}
        </div>

        <div class="modal-footer">
          ${issue.status === 'submitted' ? `
          <button class="modal-button btn-primary" onclick="reviewSubmission('${issue.id}')">
            <i class="fas fa-check"></i> Review Work
          </button>
          ` : ''}
          <button class="modal-button btn-secondary" onclick="closeIssueModal()">
            <i class="fas fa-times"></i> Close
          </button>
        </div>
      </div>
    </div>
  `

  // Add modal to document
  document.body.insertAdjacentHTML('beforeend', modalHtml)
}

// Function to close the issue modal
function closeIssueModal() {
  const modal = document.getElementById('issueModal')
  if (modal) {
    modal.remove()
  }
}

// Function to view image in fullscreen
function openImageFullscreen(imageUrl) {
  const fullscreenModal = `
    <div class="modal-overlay" onclick="this.remove()" style="cursor: zoom-out;">
      <img src="${imageUrl}" alt="Fullscreen image" style="max-width: 90%; max-height: 90%; object-fit: contain;">
    </div>
  `
  document.body.insertAdjacentHTML('beforeend', fullscreenModal)
}

function cancelIssue(id) {
  if (confirm("Are you sure you want to cancel this issue?")) {
    allIssues = allIssues.filter((issue) => issue.id !== id)
    localStorage.setItem("reportedIssues", JSON.stringify(allIssues))
    updateStats()
    displayIssues()
    alert("Issue cancelled successfully!")
  }
}

console.log("%c📋 My Issues Page Loaded", "color: #2563eb; font-size: 16px; font-weight: bold;")
