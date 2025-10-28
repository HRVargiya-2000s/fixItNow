// ========================================
// REPORT ISSUE FUNCTIONALITY
// ========================================

// ========================================
// FORM STEP MANAGEMENT
// ========================================

let currentStep = 1;
const totalSteps = 4;

// Form steps
const formSteps = document.querySelectorAll('.form-step');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const submitBtn = document.getElementById('submitBtn');

// Initialize form
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupEventListeners();
    updateStepDisplay();
});

// Initialize form
function initializeForm() {
    // Set minimum date for preferred date (today)
    const today = new Date().toISOString().split('T')[0];
    const preferredDateInput = document.getElementById('preferredDate');
    if (preferredDateInput) {
        preferredDateInput.min = today;
    }

    // Show body after initialization
    document.body.classList.add('auth-checked');
}

// Setup event listeners
function setupEventListeners() {
    // Step navigation
    if (nextBtn) {
        nextBtn.addEventListener('click', nextStep);
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', prevStep);
    }

    // Form submission
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
        reportForm.addEventListener('submit', handleFormSubmit);
    }

    // GPS location
    const getLocationBtn = document.getElementById('getLocationBtn');
    if (getLocationBtn) {
        getLocationBtn.addEventListener('click', getCurrentLocation);
    }

    // File upload
    const fileUploadArea = document.getElementById('fileUploadArea');
    const imagesInput = document.getElementById('images');

    if (fileUploadArea && imagesInput) {
        // Click to upload
        fileUploadArea.addEventListener('click', () => imagesInput.click());

        // Drag and drop
        fileUploadArea.addEventListener('dragover', handleDragOver);
        fileUploadArea.addEventListener('drop', handleFileDrop);

        // File selection
        imagesInput.addEventListener('change', handleFileSelect);
    }

    // Category selection
    const categoryOptions = document.querySelectorAll('input[name="category"]');
    categoryOptions.forEach(option => {
        option.addEventListener('change', handleCategoryChange);
    });
}

// ========================================
// STEP NAVIGATION
// ========================================

// Go to next step
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            currentStep++;
            updateStepDisplay();
        }
    }
}

// Go to previous step
function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStepDisplay();
    }
}

// Update step display
function updateStepDisplay() {
    // Update form steps
    formSteps.forEach((step, index) => {
        const stepNumber = index + 1;
        if (stepNumber === currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });

    // Update progress bar
    updateProgressBar();

    // Update navigation buttons
    updateNavigationButtons();

    // Update review summary on last step
    if (currentStep === totalSteps) {
        updateReviewSummary();
    }
}

// Update progress bar
function updateProgressBar() {
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressBar = document.querySelector('.progress-bar-fill');

    progressSteps.forEach((step, index) => {
        const stepNumber = index + 1;
        if (stepNumber <= currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });

    if (progressBar) {
        const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressBar.style.width = progress + '%';
    }
}

// Update navigation buttons
function updateNavigationButtons() {
    if (prevBtn) {
        prevBtn.style.display = currentStep > 1 ? 'inline-block' : 'none';
    }

    if (nextBtn) {
        nextBtn.style.display = currentStep < totalSteps ? 'inline-block' : 'none';
    }

    if (submitBtn) {
        submitBtn.style.display = currentStep === totalSteps ? 'inline-block' : 'none';
    }
}

// ========================================
// FORM VALIDATION
// ========================================

// Validate current step
function validateCurrentStep() {
    switch (currentStep) {
        case 1:
            return validateCategoryStep();
        case 2:
            return validateDetailsStep();
        case 3:
            return validateLocationStep();
        case 4:
            return validateReviewStep();
        default:
            return true;
    }
}

// Validate category step
function validateCategoryStep() {
    const categoryInput = document.querySelector('input[name="category"]:checked');
    if (!categoryInput) {
        showStepError('Please select a category for your issue.');
        return false;
    }
    clearStepError();
    return true;
}

// Validate details step
function validateDetailsStep() {
    const title = document.getElementById('issueTitle').value.trim();
    const urgency = document.getElementById('urgency').value;
    const description = document.getElementById('description').value.trim();

    if (!title) {
        showStepError('Please enter a title for your issue.');
        return false;
    }

    if (!urgency) {
        showStepError('Please select an urgency level.');
        return false;
    }

    if (!description || description.length < 10) {
        showStepError('Please provide a detailed description (at least 10 characters).');
        return false;
    }

    clearStepError();
    return true;
}

// Validate location step
function validateLocationStep() {
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const zipCode = document.getElementById('zipCode').value.trim();
    const contactPhone = document.getElementById('contactPhone').value.trim();

    if (!address) {
        showStepError('Please enter your street address.');
        return false;
    }

    if (!city) {
        showStepError('Please enter your city.');
        return false;
    }

    if (!zipCode) {
        showStepError('Please enter your zip code.');
        return false;
    }

    if (!contactPhone) {
        showStepError('Please enter your contact phone number.');
        return false;
    }

    clearStepError();
    return true;
}

// Validate review step
function validateReviewStep() {
    const agreeToTerms = document.getElementById('agreeToTerms').checked;
    if (!agreeToTerms) {
        showStepError('Please agree to the terms and conditions.');
        return false;
    }
    clearStepError();
    return true;
}

// Show step error
function showStepError(message) {
    clearStepError();

    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    if (currentStepElement) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'step-error';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        currentStepElement.insertBefore(errorDiv, currentStepElement.firstElementChild.nextSibling);
    }
}

// Clear step error
function clearStepError() {
    const errorDiv = document.querySelector('.step-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// ========================================
// GPS LOCATION FUNCTIONALITY
// ========================================

// Get current location
async function getCurrentLocation() {
    const getLocationBtn = document.getElementById('getLocationBtn');
    const gpsStatus = document.getElementById('gpsStatus');

    if (!navigator.geolocation) {
        showGpsStatus('GPS is not supported by this browser.', 'error');
        return;
    }

    // Show loading state
    getLocationBtn.disabled = true;
    getLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Getting Location...</span>';
    showGpsStatus('Getting your location...', 'info');

    try {
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;

        // Store coordinates
        document.getElementById('latitude').value = latitude;
        document.getElementById('longitude').value = longitude;

        // Reverse geocode to get address
        await reverseGeocode(latitude, longitude);

        showGpsStatus('Location found successfully!', 'success');
        getLocationBtn.innerHTML = '<i class="fas fa-check"></i> <span>Location Set</span>';

    } catch (error) {
        console.error('GPS Error:', error);
        showGpsStatus('Unable to get your location. Please enter address manually.', 'error');
        getLocationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> <span>Use My Current Location</span>';
    } finally {
        getLocationBtn.disabled = false;
    }
}

// Get current position promise
function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
        });
    });
}

// Reverse geocode coordinates to address
async function reverseGeocode(lat, lng) {
    try {
        // Using a free geocoding service (you might want to use Google Maps API in production)
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
        const data = await response.json();

        if (data && data.localityInfo) {
            // Fill address fields
            document.getElementById('address').value = data.localityInfo.administrative[2]?.name || '';
            document.getElementById('city').value = data.city || data.locality || '';
            document.getElementById('state').value = data.principalSubdivision || '';
            document.getElementById('zipCode').value = data.postcode || '';
            document.getElementById('country').value = data.countryName || 'United States';
        }
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        // Don't show error to user, just log it
    }
}

// Show GPS status
function showGpsStatus(message, type) {
    const gpsStatus = document.getElementById('gpsStatus');
    if (gpsStatus) {
        gpsStatus.className = `gps-status ${type}`;
        gpsStatus.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
    }
}

// ========================================
// FILE UPLOAD FUNCTIONALITY
// ========================================

// Handle drag over
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

// Handle file drop
function handleFileDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    handleFiles(files);
}

// Handle file select
function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

// Handle files
function handleFiles(files) {
    const imagePreview = document.getElementById('imagePreview');
    const maxFiles = 5;
    const maxSize = 5 * 1024 * 1024; // 5MB

    // Clear previous previews
    imagePreview.innerHTML = '';

    // Validate files
    const validFiles = [];
    for (let file of files) {
        if (validFiles.length >= maxFiles) {
            showNotification(`Maximum ${maxFiles} images allowed.`, 'warning');
            break;
        }

        if (!file.type.startsWith('image/')) {
            showNotification(`${file.name} is not an image file.`, 'error');
            continue;
        }

        if (file.size > maxSize) {
            showNotification(`${file.name} is too large. Maximum size is 5MB.`, 'error');
            continue;
        }

        validFiles.push(file);
    }

    // Create previews
    validFiles.forEach(file => {
        createImagePreview(file);
    });
}

// Create image preview
function createImagePreview(file) {
    const imagePreview = document.getElementById('imagePreview');

    const previewDiv = document.createElement('div');
    previewDiv.className = 'image-preview-item';

    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.onload = () => URL.revokeObjectURL(img.src);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-image';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.addEventListener('click', () => previewDiv.remove());

    previewDiv.appendChild(img);
    previewDiv.appendChild(removeBtn);
    imagePreview.appendChild(previewDiv);
}

// ========================================
// CATEGORY HANDLING
// ========================================

// Handle category change
function handleCategoryChange(e) {
    const selectedCategory = e.target.value;

    // You can add category-specific logic here
    console.log('Selected category:', selectedCategory);

    // Auto-fill urgency based on category (optional)
    const urgencySelect = document.getElementById('urgency');
    if (urgencySelect && !urgencySelect.value) {
        // Set default urgency based on category
        switch (selectedCategory) {
            case 'electrical':
            case 'plumbing':
                urgencySelect.value = 'high';
                break;
            case 'vehicle':
                urgencySelect.value = 'medium';
                break;
            default:
                urgencySelect.value = 'low';
        }
    }
}

// ========================================
// REVIEW SUMMARY
// ========================================

// Update review summary
function updateReviewSummary() {
    const reviewSummary = document.getElementById('reviewSummary');
    if (!reviewSummary) return;

    // Get form data
    const category = document.querySelector('input[name="category"]:checked')?.value;
    const title = document.getElementById('issueTitle').value;
    const urgency = document.getElementById('urgency').value;
    const description = document.getElementById('description').value;
    const budget = document.getElementById('budget').value;
    const preferredDate = document.getElementById('preferredDate').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const zipCode = document.getElementById('zipCode').value;
    const contactPhone = document.getElementById('contactPhone').value;

    // Create summary HTML
    const summaryHTML = `
        <div class="summary-section">
            <h3><i class="fas fa-th-large"></i> Category & Details</h3>
            <div class="summary-grid">
                <div class="summary-item">
                    <strong>Category:</strong> ${getCategoryDisplayName(category)}
                </div>
                <div class="summary-item">
                    <strong>Title:</strong> ${title}
                </div>
                <div class="summary-item">
                    <strong>Urgency:</strong> ${getUrgencyDisplayName(urgency)}
                </div>
                <div class="summary-item">
                    <strong>Budget:</strong> ${budget ? '$' + budget : 'Not specified'}
                </div>
                <div class="summary-item">
                    <strong>Preferred Date:</strong> ${preferredDate || 'Not specified'}
                </div>
            </div>
        </div>

        <div class="summary-section">
            <h3><i class="fas fa-align-left"></i> Description</h3>
            <p class="summary-description">${description}</p>
        </div>

        <div class="summary-section">
            <h3><i class="fas fa-map-marked-alt"></i> Location & Contact</h3>
            <div class="summary-grid">
                <div class="summary-item full-width">
                    <strong>Address:</strong> ${address}, ${city}, ${state} ${zipCode}
                </div>
                <div class="summary-item">
                    <strong>Phone:</strong> ${contactPhone}
                </div>
            </div>
        </div>

        <div class="summary-section">
            <h3><i class="fas fa-images"></i> Images</h3>
            <p>${document.querySelectorAll('.image-preview-item').length} image(s) attached</p>
        </div>
    `;

    reviewSummary.innerHTML = summaryHTML;
}

// Get category display name
function getCategoryDisplayName(category) {
    const names = {
        'electrical': 'Electrical',
        'plumbing': 'Plumbing',
        'vehicle': 'Vehicle',
        'furniture': 'Furniture',
        'appliance': 'Appliance',
        'hvac': 'HVAC'
    };
    return names[category] || category;
}

// Get urgency display name
function getUrgencyDisplayName(urgency) {
    const names = {
        'low': 'Low - Can wait a few days',
        'medium': 'Medium - Within 2-3 days',
        'high': 'High - Within 24 hours',
        'emergency': 'Emergency - Immediate'
    };
    return names[urgency] || urgency;
}

// ========================================
// FORM SUBMISSION
// ========================================

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateCurrentStep()) {
        return;
    }

    // Show loading
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Submitting...</span>';

    try {
        // Collect form data as JSON (not FormData) to match backend expectations
        const issueData = {
            // Basic issue data
            category: document.querySelector('input[name="category"]:checked').value,
            title: document.getElementById('issueTitle').value,
            urgency: document.getElementById('urgency').value,
            description: document.getElementById('description').value,

            // Location data (nested object as expected by backend)
            location: {
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                zipCode: document.getElementById('zipCode').value
            },

            // Contact info
            contactMethod: 'chat' // Default contact method
        };

        // Optional fields
        const budget = document.getElementById('budget').value;
        if (budget) {
            issueData.budget = {
                min: parseFloat(budget),
                max: parseFloat(budget),
                currency: 'USD'
            };
        }

        const preferredDate = document.getElementById('preferredDate').value;
        if (preferredDate) {
            issueData.preferredTime = {
                date: new Date(preferredDate).toISOString()
            };
        }

        // GPS coordinates (as array [longitude, latitude] for MongoDB 2dsphere)
        const latitude = document.getElementById('latitude').value;
        const longitude = document.getElementById('longitude').value;
        if (latitude && longitude) {
            issueData.location.coordinates = [parseFloat(longitude), parseFloat(latitude)];
        }

        // Submit to API
        const response = await window.apiClient.post('/issues', issueData);

        // Success
        showNotification('Issue reported successfully!', 'success');

        // Redirect to my issues page
        setTimeout(() => {
            window.location.href = 'my-issues.html';
        }, 2000);

    } catch (error) {
        console.error('Form submission error:', error);
        showNotification(error.message || 'Failed to submit issue. Please try again.', 'error');

        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Submit Issue';
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

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
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========================================
// CONSOLE LOGGING
// ========================================

console.log('%c🔧 Report Issue Form Initialized', 'color: #2563eb; font-size: 16px; font-weight: bold;');