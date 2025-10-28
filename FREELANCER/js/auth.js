// ========================================
// WORKER AUTHENTICATION FUNCTIONALITY
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
    
    console.log('Worker Info:', payload);
    
    // Store worker data
    const workerData = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        provider: 'google',
        loggedIn: true,
        isWorker: true,
        timestamp: new Date().getTime()
    };
    
    // Save to localStorage
    localStorage.setItem('workerAuth', JSON.stringify(workerData));
    localStorage.setItem('googleAuth', 'true');
    
    // Show success message
    showAuthMessage('success', `Welcome, ${workerData.name}!`);
    
    // Redirect to intended page or dashboard
    setTimeout(() => {
        if (typeof workerAuthGuard !== 'undefined' && workerAuthGuard.redirectAfterLogin) {
            workerAuthGuard.redirectAfterLogin();
        } else {
            window.location.href = '../index.html';
        }
    }, 1500);
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

// Initialize Google Sign-In
function initGoogleSignIn() {
    // This will be automatically initialized by Google Identity Services
    console.log('Google Sign-In initialized for workers');
}

// Handle Google Sign-Out
function handleGoogleSignOut() {
    // Clear worker data
    localStorage.removeItem('workerAuth');
    localStorage.removeItem('googleAuth');
    localStorage.removeItem('workerOnlineStatus');
    
    // Redirect to login
    window.location.href = 'pages/login.html';
}

// Show authentication message
function showAuthMessage(type, message) {
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

// Make functions globally accessible
window.handleGoogleSignIn = handleGoogleSignIn;
window.handleGoogleSignOut = handleGoogleSignOut;

// ========================================
// PASSWORD TOGGLE & VALIDATION
// ========================================

// Password Toggle Functionality
function setupPasswordToggle() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

// Password Strength Checker
function checkPasswordStrength() {
    const passwordInput = document.getElementById('password');
    const strengthBar = document.querySelector('.strength-bar');
    
    if (passwordInput && strengthBar) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            let strength = 0;
            
            if (password.length >= 8) strength++;
            if (password.match(/[a-z]/)) strength++;
            if (password.match(/[A-Z]/)) strength++;
            if (password.match(/[0-9]/)) strength++;
            if (password.match(/[^a-zA-Z0-9]/)) strength++;
            
            strengthBar.classList.remove('weak', 'medium', 'strong');
            
            if (strength <= 2) {
                strengthBar.classList.add('weak');
            } else if (strength <= 4) {
                strengthBar.classList.add('medium');
            } else {
                strengthBar.classList.add('strong');
            }
        });
    }
}

// Form Validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\d\s\-\+\(\)]+$/;
    return phone.length >= 10 && re.test(phone);
}

// Login Form Submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Clear previous errors
        document.getElementById('emailError').textContent = '';
        document.getElementById('passwordError').textContent = '';
        
        let hasError = false;
        
        // Validate email
        if (!validateEmail(email)) {
            document.getElementById('emailError').textContent = 'Please enter a valid email address';
            hasError = true;
        }
        
        // Validate password
        if (password.length < 6) {
            document.getElementById('passwordError').textContent = 'Password must be at least 6 characters';
            hasError = true;
        }
        
        if (hasError) {
            loginForm.classList.add('shake');
            setTimeout(() => loginForm.classList.remove('shake'), 500);
            return;
        }
        
        // Show loading
        const submitBtn = loginForm.querySelector('.btn-submit');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        // Simulate API call (Replace with actual authentication)
        setTimeout(() => {
            // Store worker session
            const workerData = {
                email: email,
                name: email.split('@')[0],
                loggedIn: true,
                isWorker: true,
                timestamp: new Date().getTime()
            };
            
            if (rememberMe) {
                localStorage.setItem('workerAuth', JSON.stringify(workerData));
            } else {
                sessionStorage.setItem('workerAuth', JSON.stringify(workerData));
            }
            
            // Show success and redirect
            showAuthMessage('success', 'Login successful!');
            
            setTimeout(() => {
                if (typeof workerAuthGuard !== 'undefined' && workerAuthGuard.redirectAfterLogin) {
                    workerAuthGuard.redirectAfterLogin();
                } else {
                    window.location.href = '../index.html';
                }
            }, 1000);
        }, 1500);
    });
}

// Sign Up Form Submission
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const specialty = document.getElementById('specialty').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        // Clear previous errors
        document.getElementById('nameError').textContent = '';
        document.getElementById('emailError').textContent = '';
        document.getElementById('phoneError').textContent = '';
        document.getElementById('passwordError').textContent = '';
        document.getElementById('confirmPasswordError').textContent = '';
        
        let hasError = false;
        
        // Validate name
        if (fullName.length < 3) {
            document.getElementById('nameError').textContent = 'Name must be at least 3 characters';
            hasError = true;
        }
        
        // Validate email
        if (!validateEmail(email)) {
            document.getElementById('emailError').textContent = 'Please enter a valid email address';
            hasError = true;
        }
        
        // Validate phone
        if (!validatePhone(phone)) {
            document.getElementById('phoneError').textContent = 'Please enter a valid phone number';
            hasError = true;
        }
        
        // Validate specialty
        if (!specialty) {
            hasError = true;
            alert('Please select your specialty');
        }
        
        // Validate password
        if (password.length < 8) {
            document.getElementById('passwordError').textContent = 'Password must be at least 8 characters';
            hasError = true;
        }
        
        // Validate confirm password
        if (password !== confirmPassword) {
            document.getElementById('confirmPasswordError').textContent = 'Passwords do not match';
            hasError = true;
        }
        
        // Validate terms
        if (!agreeTerms) {
            alert('Please accept the Terms & Conditions');
            hasError = true;
        }
        
        if (hasError) {
            signupForm.classList.add('shake');
            setTimeout(() => signupForm.classList.remove('shake'), 500);
            return;
        }
        
        // Show loading
        const submitBtn = signupForm.querySelector('.btn-submit');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        // Simulate API call (Replace with actual registration)
        setTimeout(() => {
            // Store worker data
            const workerData = {
                name: fullName,
                email: email,
                phone: phone,
                specialty: specialty,
                loggedIn: true,
                isWorker: true,
                timestamp: new Date().getTime()
            };
            
            localStorage.setItem('workerAuth', JSON.stringify(workerData));
            
            // Show success and redirect
            showAuthMessage('success', 'Account created successfully!');
            
            setTimeout(() => {
                if (typeof workerAuthGuard !== 'undefined' && workerAuthGuard.redirectAfterLogin) {
                    workerAuthGuard.redirectAfterLogin();
                } else {
                    window.location.href = '../index.html';
                }
            }, 1000);
        }, 1500);
    });
}

// Initialize password toggle and strength checker
setupPasswordToggle();
checkPasswordStrength();

// Check if worker is already logged in
function checkAuthStatus() {
    const worker = JSON.parse(localStorage.getItem('workerAuth') || sessionStorage.getItem('workerAuth') || '{}');
    if (worker.loggedIn) {
        console.log('Worker is logged in:', worker.name);
        updateNavbarForLoggedInWorker(worker);
    }
}

// Update navbar to show logged-in worker
function updateNavbarForLoggedInWorker(worker) {
    const authButton = document.querySelector('.btn-nav-login');
    if (authButton && worker.loggedIn) {
        authButton.innerHTML = worker.picture 
            ? `<img src="${worker.picture}" alt="${worker.name}" class="user-avatar" title="${worker.name}">` 
            : `<i class="fas fa-user-circle"></i>`;
        authButton.href = '#';
        authButton.addEventListener('click', (e) => {
            e.preventDefault();
            showWorkerMenu(worker);
        });
    }
}

// Show worker menu dropdown
function showWorkerMenu(worker) {
    const existingMenu = document.querySelector('.user-menu-dropdown');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }
    
    const menu = document.createElement('div');
    menu.className = 'user-menu-dropdown';
    menu.innerHTML = `
        <div class="user-menu-header">
            ${worker.picture ? `<img src="${worker.picture}" alt="${worker.name}">` : '<i class="fas fa-user-circle"></i>'}
            <div>
                <strong>${worker.name}</strong>
                <small>${worker.email}</small>
                ${worker.specialty ? `<small><i class="fas fa-wrench"></i> ${worker.specialty}</small>` : ''}
            </div>
        </div>
        <div class="user-menu-items">
            <a href="pages/job-requests.html"><i class="fas fa-clipboard-list"></i> Job Requests</a>
            <a href="pages/ongoing-jobs.html"><i class="fas fa-tasks"></i> Ongoing Jobs</a>
            <a href="pages/completed-jobs.html"><i class="fas fa-check-circle"></i> Completed Jobs</a>
            <a href="#"><i class="fas fa-cog"></i> Settings</a>
            <a href="#" onclick="handleGoogleSignOut()"><i class="fas fa-sign-out-alt"></i> Logout</a>
        </div>
    `;
    
    const authButton = document.querySelector('.btn-nav-login');
    authButton.parentElement.appendChild(menu);
    
    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target) && e.target !== authButton) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 100);
}

// Run auth status check on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuthStatus);
} else {
    checkAuthStatus();
}
