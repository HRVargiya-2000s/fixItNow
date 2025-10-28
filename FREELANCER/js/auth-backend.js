// ========================================
// AUTHENTICATION BACKEND INTEGRATION
// ========================================

// ========================================
// GOOGLE AUTHENTICATION
// ========================================

// Handle Google Sign-In Response
function handleGoogleSignIn(response) {
    console.log('Google Sign-In Response:', response);

    // Decode the JWT credential to get user information
    const credential = response.credential;
    const payload = parseJwt(credential);

    console.log('User Info:', payload);

    // Prepare data for backend
    const userData = {
        googleId: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        provider: 'google'
    };

    // Call backend API for Google authentication
    authenticateWithBackend('google', userData);
}

// Decode JWT token to get user info
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Error parsing JWT:', e);
        return null;
    }
}

// Authenticate with backend
async function authenticateWithBackend(provider, userData) {
    try {
        let response;

        if (provider === 'google') {
            // Google OAuth authentication
            response = await window.apiClient.post('/auth/google', userData);
        } else {
            // Regular email/password authentication
            response = await window.apiClient.post('/auth/login', userData);
        }

        // Store authentication data
        if (response.token) {
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('userData', JSON.stringify(response.user));
            if (response.workerProfile) {
                localStorage.setItem('workerProfile', JSON.stringify(response.workerProfile));
            }
        }

        // Show success message
        showAuthMessage('success', `Welcome, ${response.user.name}!`);

        // Redirect based on user role
        setTimeout(() => {
            if (response.user.role === 'worker') {
                window.location.href = '../index.html';
            } else {
                window.location.href = '../index.html';
            }
        }, 1500);

    } catch (error) {
        console.error('Authentication error:', error);
        showAuthMessage('error', error.message || 'Authentication failed. Please try again.');
    }
}

// ========================================
// FORM AUTHENTICATION
// ========================================

// Login Form Submission
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe')?.checked;

    // Clear previous errors
    clearFormErrors();

    // Basic validation
    if (!email || !password) {
        showAuthMessage('error', 'Please fill in all fields');
        return;
    }

    // Show loading
    const submitBtn = event.target.querySelector('.btn-submit');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
        const response = await window.apiClient.post('/auth/login', {
            email: email,
            password: password,
            rememberMe: rememberMe
        });

        // Store authentication data
        if (response.token) {
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('userData', JSON.stringify(response.user));
            if (response.workerProfile) {
                localStorage.setItem('workerProfile', JSON.stringify(response.workerProfile));
            }
        }

        // Show success and redirect
        showAuthMessage('success', 'Login successful!');

        setTimeout(() => {
            if (response.user.role === 'worker') {
                window.location.href = '../index.html';
            } else {
                window.location.href = '../index.html';
            }
        }, 1000);

    } catch (error) {
        console.error('Login error:', error);
        showAuthMessage('error', error.message || 'Login failed. Please check your credentials.');

        // Re-enable button
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Signup Form Submission
async function handleSignup(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const userData = {
        name: formData.get('fullName') || formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone'),
        specialty: formData.get('specialty'),
        role: window.location.pathname.includes('freelancer') ? 'worker' : 'user'
    };

    // Clear previous errors
    clearFormErrors();

    // Basic validation
    if (!userData.name || !userData.email || !userData.password) {
        showAuthMessage('error', 'Please fill in all required fields');
        return;
    }

    if (userData.password !== formData.get('confirmPassword')) {
        showAuthMessage('error', 'Passwords do not match');
        return;
    }

    // Show loading
    const submitBtn = event.target.querySelector('.btn-submit');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
        const response = await window.apiClient.post('/auth/register', userData);

        // Store authentication data
        if (response.token) {
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('userData', JSON.stringify(response.user));
            if (response.workerProfile) {
                localStorage.setItem('workerProfile', JSON.stringify(response.workerProfile));
            }
        }

        // Show success and redirect
        showAuthMessage('success', 'Account created successfully!');

        setTimeout(() => {
            if (response.user.role === 'worker') {
                window.location.href = '../index.html';
            } else {
                window.location.href = '../index.html';
            }
        }, 1000);

    } catch (error) {
        console.error('Signup error:', error);
        showAuthMessage('error', error.message || 'Registration failed. Please try again.');

        // Re-enable button
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Clear form errors
function clearFormErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');
}

// Show authentication message
function showAuthMessage(type, message) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.auth-message');
    existingMessages.forEach(msg => msg.remove());

    const messageDiv = document.createElement('div');
    messageDiv.className = `auth-message auth-message-${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.classList.add('show');
    }, 100);

    setTimeout(() => {
        messageDiv.classList.remove('show');
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// Logout function
async function handleLogout() {
    try {
        await window.apiClient.post('/auth/logout');
    } catch (error) {
        console.error('Logout error:', error);
    }

    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('workerProfile');

    // Redirect to login
    window.location.href = 'login.html';
}

// ========================================
// INITIALIZATION
// ========================================

// Initialize authentication handlers
document.addEventListener('DOMContentLoaded', function() {
    // Set up form handlers
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Make functions globally available
    window.handleGoogleSignIn = handleGoogleSignIn;
    window.handleLogout = handleLogout;
    window.showAuthMessage = showAuthMessage;
});