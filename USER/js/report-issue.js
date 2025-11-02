// ========================================
// REPORT ISSUE FUNCTIONALITY
// ========================================

// Firebase is already initialized in config.js
const firebaseApp = window.firebase // Firebase app is initialized in config.js
const dbInstance = firebaseApp.firestore() // Firestore instance

// ========================================
// FORM STEP MANAGEMENT
// ========================================

let currentStep = 1
const totalSteps = 4

// Form steps
const formSteps = document.querySelectorAll(".form-step")
const nextBtn = document.getElementById("nextBtn")
const prevBtn = document.getElementById("prevBtn")
const submitBtn = document.getElementById("submitBtn")

// Initialize form
document.addEventListener("DOMContentLoaded", () => {
  initializeForm()
  setupEventListeners()
  updateStepDisplay()

  if (window.CloudinaryUpload) {
    window.CloudinaryUpload.init()
  }
})

// Initialize form
function initializeForm() {
  // Set minimum date for preferred date (today)
  const today = new Date().toISOString().split("T")[0]
  const preferredDateInput = document.getElementById("preferredDate")
  if (preferredDateInput) {
    preferredDateInput.min = today
  }

  // Show body after initialization
  document.body.classList.add("auth-checked")
}

// Setup event listeners
function setupEventListeners() {
  // Step navigation
  if (nextBtn) {
    nextBtn.addEventListener("click", nextStep)
  }
  if (prevBtn) {
    prevBtn.addEventListener("click", prevStep)
  }

  // Form submission - Fixed form ID from reportForm to reportIssueForm
  const reportForm = document.getElementById("reportIssueForm")
  if (reportForm) {
    reportForm.addEventListener("submit", handleFormSubmit)
  }

  // GPS location
  const getLocationBtn = document.getElementById("getLocationBtn")
  if (getLocationBtn) {
    getLocationBtn.addEventListener("click", getCurrentLocation)
  }

  // File upload
  const uploadArea = document.getElementById("uploadArea");
  const uploadButton = document.getElementById("uploadButton");
  const imagesInput = document.getElementById("images");

  if (uploadArea && uploadButton && imagesInput) {
    // Drag and drop events
    uploadArea.addEventListener("dragenter", (e) => {
      e.preventDefault();
      uploadArea.classList.add("dragover");
    });

    uploadArea.addEventListener("dragleave", (e) => {
      e.preventDefault();
      uploadArea.classList.remove("dragover");
    });

    uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadArea.classList.add("dragover");
    });

    uploadArea.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadArea.classList.remove("dragover");
      if (window.CloudinaryUpload) {
        window.CloudinaryUpload.handleFiles(e.dataTransfer.files);
      }
    });

    // Click to upload - trigger file input
    uploadButton.addEventListener("click", (e) => {
      e.preventDefault();
      imagesInput.click();
    });

    // Handle file input change
    imagesInput.addEventListener("change", (e) => {
      if (window.CloudinaryUpload) {
        window.CloudinaryUpload.handleFiles(e.target.files);
      }
    });
  }

  // Category selection
  const categoryOptions = document.querySelectorAll('input[name="category"]')
  categoryOptions.forEach((option) => {
    option.addEventListener("change", handleCategoryChange)
  })
}

// ========================================
// STEP NAVIGATION
// ========================================

// Go to next step
function nextStep() {
  console.log("[v0] nextStep called, currentStep:", currentStep)

  if (validateCurrentStep()) {
    console.log("[v0] Validation passed, moving to next step")
    if (currentStep < totalSteps) {
      currentStep++
      updateStepDisplay()
    }
  } else {
    console.log("[v0] Validation failed for step:", currentStep)
  }
}

// Go to previous step
function prevStep() {
  if (currentStep > 1) {
    currentStep--
    updateStepDisplay()
  }
}

// Update step display
function updateStepDisplay() {
  // Update form steps
  formSteps.forEach((step, index) => {
    const stepNumber = index + 1
    if (stepNumber === currentStep) {
      step.classList.add("active")
    } else {
      step.classList.remove("active")
    }
  })

  // Update progress bar
  updateProgressBar()

  // Update navigation buttons
  updateNavigationButtons()

  // Update review summary on last step
  if (currentStep === totalSteps) {
    updateReviewSummary()
  }
}

// Update progress bar
function updateProgressBar() {
  const progressSteps = document.querySelectorAll(".progress-step")
  const progressBar = document.querySelector(".progress-bar-fill")

  progressSteps.forEach((step, index) => {
    const stepNumber = index + 1
    if (stepNumber <= currentStep) {
      step.classList.add("active")
    } else {
      step.classList.remove("active")
    }
  })

  if (progressBar) {
    const progress = ((currentStep - 1) / (totalSteps - 1)) * 100
    progressBar.style.width = progress + "%"
  }
}

// Update navigation buttons
function updateNavigationButtons() {
  if (prevBtn) {
    prevBtn.style.display = currentStep > 1 ? "inline-block" : "none"
  }

  if (nextBtn) {
    nextBtn.style.display = currentStep < totalSteps ? "inline-block" : "none"
  }

  if (submitBtn) {
    submitBtn.style.display = currentStep === totalSteps ? "inline-block" : "none"
  }
}

// ========================================
// FORM VALIDATION
// ========================================

// Validate current step
function validateCurrentStep() {
  switch (currentStep) {
    case 1:
      return validateCategoryStep()
    case 2:
      return validateDetailsStep()
    case 3:
      return validateLocationStep()
    case 4:
      return validateReviewStep()
    default:
      return true
  }
}

// Validate category step
function validateCategoryStep() {
  const categoryInput = document.querySelector('input[name="category"]:checked')
  console.log("[v0] Category validation - checked input:", categoryInput)

  if (!categoryInput) {
    showStepError("Please select a category for your issue.")
    return false
  }
  clearStepError()
  return true
}

// Validate details step
function validateDetailsStep() {
  const title = document.getElementById("issueTitle").value.trim()
  const urgency = document.getElementById("urgency").value
  const description = document.getElementById("description").value.trim()

  if (!title) {
    showStepError("Please enter a title for your issue.")
    return false
  }

  if (!urgency) {
    showStepError("Please select an urgency level.")
    return false
  }

  // Require a short but reasonable description (reduced from 10 to 3 chars to avoid blocking users)
  if (!description || description.length < 3) {
    showStepError("Please provide a brief description (at least 3 characters).")
    return false
  }

  clearStepError()
  return true
}

// Validate location step
function validateLocationStep() {
  const address = document.getElementById("address").value.trim()
  const city = document.getElementById("city").value.trim()
  const zipCode = document.getElementById("zipCode").value.trim()
  const contactPhone = document.getElementById("contactPhone").value.trim()

  if (!address) {
    showStepError("Please enter your street address.")
    return false
  }

  if (!city) {
    showStepError("Please enter your city.")
    return false
  }

  if (!zipCode) {
    showStepError("Please enter your zip code.")
    return false
  }

  if (!contactPhone) {
    showStepError("Please enter your contact phone number.")
    return false
  }

  clearStepError()
  return true
}

// Validate review step
function validateReviewStep() {
  const agreeToTerms = document.getElementById("agreeToTerms").checked
  if (!agreeToTerms) {
    showStepError("Please agree to the terms and conditions.")
    return false
  }
  clearStepError()
  return true
}

// Show step error
function showStepError(message) {
  clearStepError()

  const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`)
  if (currentStepElement) {
    const errorDiv = document.createElement("div")
    errorDiv.className = "step-error"
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`
    currentStepElement.insertBefore(errorDiv, currentStepElement.firstElementChild.nextSibling)
  }
}

// Clear step error
function clearStepError() {
  const errorDiv = document.querySelector(".step-error")
  if (errorDiv) {
    errorDiv.remove()
  }
}

// ========================================
// GPS LOCATION FUNCTIONALITY
// ========================================

// Get current location
async function getCurrentLocation() {
  const getLocationBtn = document.getElementById("getLocationBtn")
  const gpsStatus = document.getElementById("gpsStatus")

  if (!navigator.geolocation) {
    showGpsStatus("GPS is not supported by this browser.", "error")
    return
  }

  // Show loading state
  getLocationBtn.disabled = true
  getLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Getting Location...</span>'
  showGpsStatus("Getting your location...", "info")

  try {
    const position = await getCurrentPosition()
    const { latitude, longitude } = position.coords

    // Store coordinates
    document.getElementById("latitude").value = latitude
    document.getElementById("longitude").value = longitude

    // Reverse geocode to get address
    await reverseGeocode(latitude, longitude)

    showGpsStatus("Location found successfully!", "success")
    getLocationBtn.innerHTML = '<i class="fas fa-check"></i> <span>Location Set</span>'
  } catch (error) {
    console.error("GPS Error:", error)
    showGpsStatus("Unable to get your location. Please enter address manually.", "error")
    getLocationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> <span>Use My Current Location</span>'
  } finally {
    getLocationBtn.disabled = false
  }
}

// Get current position promise
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
    })
  })
}

// Reverse geocode coordinates to address
async function reverseGeocode(lat, lng) {
  try {
    // Using a free geocoding service (you might want to use Google Maps API in production)
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
    )
    const data = await response.json()

    if (data && data.localityInfo) {
      // Fill address fields
      document.getElementById("address").value = data.localityInfo.administrative[2]?.name || ""
      document.getElementById("city").value = data.city || data.locality || ""
      document.getElementById("state").value = data.principalSubdivision || ""
      document.getElementById("zipCode").value = data.postcode || ""
      document.getElementById("country").value = data.countryName || "United States"
    }
  } catch (error) {
    console.error("Reverse geocoding error:", error)
    // Don't show error to user, just log it
  }
}

// Show GPS status
function showGpsStatus(message, type) {
  const gpsStatus = document.getElementById("gpsStatus")
  if (gpsStatus) {
    gpsStatus.className = `gps-status ${type}`
    gpsStatus.innerHTML = `<i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i> ${message}`
  }
}

// ========================================
// FILE UPLOAD FUNCTIONALITY
// ========================================

// File upload is now handled by Cloudinary.js
// No need for additional file handling here// ========================================
// CATEGORY HANDLING
// ========================================

// Handle category change
function handleCategoryChange(e) {
  const selectedCategory = e.target.value

  // You can add category-specific logic here
  console.log("Selected category:", selectedCategory)

  // Auto-fill urgency based on category (optional)
  const urgencySelect = document.getElementById("urgency")
  if (urgencySelect && !urgencySelect.value) {
    // Set default urgency based on category
    switch (selectedCategory) {
      case "electrical":
      case "plumbing":
        urgencySelect.value = "high"
        break
      case "vehicle":
        urgencySelect.value = "medium"
        break
      default:
        urgencySelect.value = "low"
    }
  }
}

// ========================================
// REVIEW SUMMARY
// ========================================

// Update review summary
function updateReviewSummary() {
  const reviewSummary = document.getElementById("reviewSummary")
  if (!reviewSummary) return

  // Get form data
  const category = document.querySelector('input[name="category"]:checked')?.value
  const title = document.getElementById("issueTitle").value
  const urgency = document.getElementById("urgency").value
  const description = document.getElementById("description").value
  const budget = document.getElementById("budget").value
  const preferredDate = document.getElementById("preferredDate").value
  const address = document.getElementById("address").value
  const city = document.getElementById("city").value
  const state = document.getElementById("state").value
  const zipCode = document.getElementById("zipCode").value
  const contactPhone = document.getElementById("contactPhone").value

  // Get uploaded images count from Cloudinary
  const uploadedImages = window.CloudinaryUpload ? window.CloudinaryUpload.getUploadedImages() : []
  const imageCount = uploadedImages.length;

  // Get formatted date if available
  const formattedDate = preferredDate ? new Date(preferredDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : "Not specified";

  // Create summary HTML
  const summaryHTML = `
        <div class="review-card">
            <div class="review-section category-section">
                <h3><i class="fas fa-th-large"></i> Category & Details</h3>
                <div class="review-grid">
                    <div class="review-item category-item">
                        <strong>Category:</strong>
                        <span class="category-badge ${category || ''}">
                            <i class="fas fa-${getCategoryIcon(category)}"></i>
                            ${getCategoryDisplayName(category)}
                        </span>
                    </div>
                    <div class="review-item">
                        <strong>Title:</strong>
                        <span class="title-text">${title}</span>
                    </div>
                    <div class="review-item">
                        <strong>Urgency:</strong>
                        <span class="urgency-badge ${urgency || ''}">
                            ${getUrgencyDisplayName(urgency)}
                        </span>
                    </div>
                    <div class="review-item">
                        <strong>Budget:</strong>
                        <span class="budget-amount">${budget ? "$" + budget : "Not specified"}</span>
                    </div>
                    <div class="review-item">
                        <strong>Preferred Date:</strong>
                        <span class="date-value">${formattedDate}</span>
                    </div>
                </div>
            </div>

            <div class="review-section description-section">
                <h3><i class="fas fa-align-left"></i> Description</h3>
                <div class="description-content">
                    <p class="review-description">${description}</p>
                </div>
            </div>

            <div class="review-section location-section">
                <h3><i class="fas fa-map-marked-alt"></i> Location & Contact</h3>
                <div class="location-grid">
                    <div class="location-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${address}, ${city}, ${state} ${zipCode}</span>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-phone"></i>
                        <span>${contactPhone}</span>
                    </div>
                </div>
            </div>

            <div class="review-section attachments-section">
                <h3><i class="fas fa-images"></i> Attachments</h3>
                <div class="attachments-status">
                    <i class="fas fa-${imageCount > 0 ? 'check-circle text-success' : 'info-circle text-info'}"></i>
                    <span>${imageCount} image${imageCount !== 1 ? 's' : ''} attached</span>
                </div>
            </div>
        </div>
    `

  reviewSummary.innerHTML = summaryHTML
}

// Get category display name
function getCategoryDisplayName(category) {
  const names = {
    electrical: "Electrical",
    plumbing: "Plumbing",
    vehicle: "Vehicle",
    furniture: "Furniture",
    appliance: "Appliance",
    hvac: "HVAC",
  }
  return names[category] || category
}

// Get urgency display name
function getUrgencyDisplayName(urgency) {
  const names = {
    low: "Low - Can wait a few days",
    medium: "Medium - Within 2-3 days",
    high: "High - Within 24 hours",
    emergency: "Emergency - Immediate",
  }
  return names[urgency] || urgency
}

// Get category icon
function getCategoryIcon(category) {
  const icons = {
    electrical: "bolt",
    plumbing: "faucet",
    vehicle: "car",
    furniture: "couch",
    appliance: "blender",
    hvac: "temperature-high",
  }
  return icons[category] || "wrench"
}

// ========================================
// FORM SUBMISSION - FIREBASE + CLOUDINARY
// ========================================

async function handleFormSubmit(e) {
  e.preventDefault()

  if (!validateCurrentStep()) {
    return
  }

  const submitBtn = document.getElementById("submitBtn")
  submitBtn.disabled = true
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Submitting...</span>'

  try {
    if (!window.unifiedAuth || !window.unifiedAuth.isAuthenticated()) {
      showNotification("Please login to report an issue", "error")
      window.location.href = "login.html"
      return
    }

    // Gather all form data
    const category = document.querySelector('input[name="category"]:checked').value
    const title = document.getElementById("issueTitle").value
    const urgency = document.getElementById("urgency").value
    const description = document.getElementById("description").value
    const budgetValue = document.getElementById("budget").value
    const preferredDateValue = document.getElementById("preferredDate").value

    // Location and contact
    const address = document.getElementById("address").value
    const city = document.getElementById("city").value
    const state = document.getElementById("state").value
    const zipCode = document.getElementById("zipCode").value
    const latitude = document.getElementById("latitude").value
    const longitude = document.getElementById("longitude").value
    const contactPhone = document.getElementById("contactPhone").value

    // Cloudinary images
    const imageUrls =
      window.CloudinaryUpload && window.CloudinaryUpload.getImageUrls ? window.CloudinaryUpload.getImageUrls() : []

    const user = window.unifiedAuth.getUser()
    const userId = user ? user.uid : null

    // Compose issue record
    const issueData = {
      category,
      title,
      urgency,
      description,
      images: imageUrls,
      location: {
        address,
        city,
        state,
        zipCode,
        coordinates: [Number.parseFloat(longitude) || 0, Number.parseFloat(latitude) || 0],
      },
      contactPhone,
      budget: budgetValue
        ? {
            min: Number.parseFloat(budgetValue),
            max: Number.parseFloat(budgetValue),
            currency: "USD",
          }
        : undefined,
      preferredTime: preferredDateValue
        ? {
            date: new Date(preferredDateValue).toISOString(),
          }
        : undefined,
      userId: userId,
      createdAt: firebaseApp.firestore.FieldValue.serverTimestamp(),
      status: "pending",
      matchedWorkers: [], // Initialize empty array so Firestore query works immediately
      matchedAt: firebaseApp.firestore.FieldValue.serverTimestamp(),
    }

    // Save to Firestore
    const issueRef = await dbInstance.collection("issues").add(issueData)

    // Dynamic matching: find workers who handle this category and add their IDs to the issue
    try {
      console.log('[v0] Searching for workers with category:', category)
      const workersSnapshot = await dbInstance
        .collection('workers')
        .where('categories', 'array-contains', category)
        .get()

      console.log('[v0] Found', workersSnapshot.size, 'workers for category:', category)
      
      const matchedWorkerIds = []
      workersSnapshot.forEach((doc) => {
        matchedWorkerIds.push(doc.id)
        console.log('[v0] Worker matched - ID:', doc.id, 'Data:', doc.data())
      })

      if (matchedWorkerIds.length > 0) {
        await issueRef.update({ matchedWorkers: matchedWorkerIds, matchedAt: firebaseApp.firestore.FieldValue.serverTimestamp() })
        console.log('[v0] Issue matched to workers:', matchedWorkerIds)

        // Create per-worker notifications under workers/{workerId}/notifications
        try {
          const notificationPromises = matchedWorkerIds.map((workerId) => {
            const notif = {
              issueId: issueRef.id,
              issueTitle: title,
              category: category,
              read: false,
              createdAt: firebaseApp.firestore.FieldValue.serverTimestamp(),
              message: `New ${getCategoryDisplayName(category)} request: ${title}`,
            }
            return dbInstance.collection('workers').doc(workerId).collection('notifications').add(notif)
          })

          await Promise.all(notificationPromises)
          console.log('[v0] Notifications created for matched workers')
        } catch (notifErr) {
          console.error('[v0] Error creating notifications:', notifErr)
        }
      } else {
        await issueRef.update({ matchedWorkers: [], matchedAt: firebaseApp.firestore.FieldValue.serverTimestamp() })
        console.log('[v0] No matching workers found for category:', category)
      }
    } catch (matchErr) {
      console.error('[v0] Error while matching workers:', matchErr)
      // Do not block success for user — issue is already saved
    }

    // Also save to localStorage for immediate display
    const storedIssues = localStorage.getItem("reportedIssues") || "[]"
    const issues = JSON.parse(storedIssues)
    issues.push({
      id: Date.now(),
      ...issueData,
      createdAt: new Date().toISOString(),
    })
    localStorage.setItem("reportedIssues", JSON.stringify(issues))

    showNotification("Issue reported successfully!", "success")
    setTimeout(() => {
      window.location.href = "my-issues.html"
    }, 2000)
  } catch (error) {
    console.error("[v0] Form submission error:", error)
    showNotification(error.message || "Failed to submit issue. Please try again.", "error")
    submitBtn.disabled = false
    submitBtn.innerHTML = '<i class="fas fa-check"></i> Submit Issue'
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Show notification
function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.innerHTML = `
        <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
        <span>${message}</span>
    `

  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6"};
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

  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease"
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

// ========================================
// CONSOLE LOGGING
// ========================================

console.log("%c🔧 Report Issue Form Initialized", "color: #2563eb; font-size: 16px; font-weight: bold;")
