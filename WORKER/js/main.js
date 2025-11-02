// ========================================
// FREELANCER/WORKER PORTAL - Main JS
// ========================================

// ========================================
// AUTHENTICATION & USER MANAGEMENT
// ========================================

// Update navigation based on auth status (shows profile viewer with name & email like USER portal)
async function updateNavigation() {
    const loginLink = document.querySelector('.btn-nav-login');
    if (!loginLink) return;

    // try to obtain user data from available auth wrappers
    let user = null;
    let workerData = null;
    try {
        if (window.workerAuthGuard && typeof window.workerAuthGuard.getUser === 'function') user = window.workerAuthGuard.getUser();
        if ((!user || !user.email) && window.workerAuth && typeof window.workerAuth.getUser === 'function') user = window.workerAuth.getUser();
        if (window.workerAuth && typeof window.workerAuth.getWorkerData === 'function') workerData = window.workerAuth.getWorkerData();
        if (!workerData && window.workerAuthGuard && typeof window.workerAuthGuard.getWorkerData === 'function') workerData = window.workerAuthGuard.getWorkerData();
    } catch (err) { /* ignore */ }

    const loggedIn = !!(user || workerData || (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser));

    if (loggedIn) {
        // Build display values
        const displayName = (user && (user.name || user.displayName)) || (workerData && workerData.fullName) || 'Worker';
        const email = (user && (user.email)) || (workerData && workerData.email) || '';

        // If the page already provides a static #profileDropdown (index.html and other pages), populate that instead
        const existingDropdown = document.getElementById('profileDropdown');
        const profileToggle = document.querySelector('.btn-nav-login');

        if (existingDropdown && profileToggle) {
            // Populate the header area (keeps the small, absolute-positioned dropdown the page author created)
            const header = existingDropdown.querySelector('.user-menu-header');
            if (header) {
                const img = header.querySelector('img');
                if (img) {
                    if ((workerData && workerData.picture) || (user && user.profilePicture)) {
                        img.src = (workerData && workerData.picture) || (user && user.profilePicture);
                    } else {
                        img.src = 'images/logo.svg';
                    }
                }
                const info = header.querySelector('div');
                if (info) {
                    info.innerHTML = `<div style="font-weight:600;">${displayName}</div><div style="font-size:12px; opacity:0.85;">${email || 'Manage your account'}</div>`;
                }
            }

            // Update toggle icon
            try {
                if ((workerData && workerData.picture)) {
                    profileToggle.innerHTML = `<img src="${workerData.picture}" alt="${displayName}" style="width:28px;height:28px;border-radius:50%">`;
                } else {
                    profileToggle.innerHTML = '<i class="fas fa-user-circle" style="font-size:1.2rem"></i>';
                }
                profileToggle.title = displayName;
            } catch (e) { /* ignore */ }

            // Wire the dropdown's existing logout / nav links if present
            const logoutLink = existingDropdown.querySelector('#menuLogout');
            if (logoutLink) {
                logoutLink.addEventListener('click', async (e) => {
                    e.preventDefault();
                    try { sessionStorage.removeItem('justLoggedIn'); } catch(e){}
                    if (window.workerAuthGuard && typeof window.workerAuthGuard.logout === 'function') {
                        await window.workerAuthGuard.logout();
                    } else if (window.workerAuth && typeof window.workerAuth.logout === 'function') {
                        await window.workerAuth.logout();
                    } else if (typeof auth !== 'undefined' && auth.signOut) {
                        try { await auth.signOut(); } catch(e){}
                        const path = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
                        window.location.replace(path);
                    } else {
                        const path = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
                        window.location.replace(path);
                    }
                });
            }

            // Ensure the dropdown is hidden by default and toggled by the profileToggle click (pages often already include this wiring)
            try {
                existingDropdown.style.display = existingDropdown.style.display || 'none';
            } catch(e){}

            // stop here; we used the page's dropdown so we won't inject a large inline profile viewer
            return;
        }

        // Fallback: inject a compact profile-viewer if the page doesn't include a profileDropdown
        loginLink.innerHTML = `
            <div class="profile-viewer">
                <div class="profile-avatar"><i class="fas fa-user-circle"></i></div>
                <div class="profile-menu">
                    <div class="profile-header">
                        <div class="profile-avatar-large"><i class="fas fa-user-circle"></i></div>
                        <div class="profile-info">
                            <p class="profile-name">${displayName}</p>
                            <p class="profile-email">${email}</p>
                        </div>
                    </div>
                    <div class="profile-divider"></div>
                    <button type="button" class="profile-menu-item" id="profileNewJobsBtn"><i class="fas fa-inbox"></i> New Jobs</button>
                    <div class="profile-divider"></div>
                    <button class="profile-menu-item logout-btn" id="logoutBtn" style="color: #ef4444;"><i class="fas fa-sign-out-alt"></i> Logout</button>
                </div>
            </div>
        `;

        // Convert loginLink to button-like element
        try { loginLink.removeAttribute('href'); loginLink.setAttribute('role','button'); loginLink.style.cursor = 'pointer'; loginLink.onclick = (ev) => ev.preventDefault(); } catch(e){ }

        const profileViewer = loginLink.querySelector('.profile-viewer');
        if (profileViewer) {
            const profileAvatar = profileViewer.querySelector('.profile-avatar');
            profileAvatar.addEventListener('click', (e) => {
                e.preventDefault(); e.stopPropagation();
                const menu = profileViewer.querySelector('.profile-menu');
                menu.classList.toggle('active');
            });

            document.addEventListener('click', (e) => {
                if (!profileViewer.contains(e.target)) {
                    const menu = profileViewer.querySelector('.profile-menu'); if (menu) menu.classList.remove('active');
                }
            });
        }

        // Attach actions for the injected fallback
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                try { sessionStorage.removeItem('justLoggedIn'); } catch(e){}
                if (window.workerAuthGuard && typeof window.workerAuthGuard.logout === 'function') {
                    await window.workerAuthGuard.logout();
                } else if (window.workerAuth && typeof window.workerAuth.logout === 'function') {
                    await window.workerAuth.logout();
                } else if (typeof auth !== 'undefined' && auth.signOut) {
                    try { await auth.signOut(); } catch(e){}
                    const path = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
                    window.location.replace(path);
                }
            });
        }

        const newJobsBtn = document.getElementById('profileNewJobsBtn');
        if (newJobsBtn) newJobsBtn.addEventListener('click', (e) => { e.preventDefault(); const path = window.location.pathname.includes('/pages/') ? 'job-requests.html' : 'pages/job-requests.html'; window.location.href = path; });

    } else {
        // show login icon/link
        loginLink.innerHTML = '<i class="fas fa-user"></i>';
        loginLink.title = 'Login';
        try { loginLink.href = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html'; } catch(e){}
    }
}

// ========================================
// THEME TOGGLE (Light/Dark Mode)
// ========================================

const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

if (themeToggle) {
    // Check for saved theme preference or default to 'light'
    const currentTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', currentTheme);

    // Update icon based on current theme
    updateThemeIcon(currentTheme);

    themeToggle.addEventListener('click', () => {
        let theme = htmlElement.getAttribute('data-theme');
        let newTheme = theme === 'light' ? 'dark' : 'light';

        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
}

// ========================================
// MOBILE NAVIGATION TOGGLE
// ========================================

const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');

        // Change icon
        const icon = navToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when clicking on a link
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = navToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
}

// ========================================
// ONLINE/OFFLINE STATUS TOGGLE - FIREBASE
// ========================================
const onlineStatusCheckbox = document.getElementById('onlineStatus');
const statusLabel = document.querySelector('.status-label .status-text');

function updateStatusText(isOnline) {
    if (statusLabel) {
        statusLabel.textContent = isOnline ? 'Online' : 'Offline';
    }
}

if (onlineStatusCheckbox && statusLabel) {
    // Load saved status
    const isOnline = localStorage.getItem('workerOnlineStatus') === 'true';
    onlineStatusCheckbox.checked = isOnline;
    updateStatusText(isOnline);
    
    // Handle toggle change
    onlineStatusCheckbox.addEventListener('change', async function() {
        const newStatus = this.checked;
        localStorage.setItem('workerOnlineStatus', newStatus);
        updateStatusText(newStatus);
        
        // Update status in Firebase
        if (window.workerAuth && window.workerAuth.isAuthenticated()) {
            try {
                // ✅ FIREBASE VERSION - NO API CLIENT
                await window.workerAuth.updateAvailability(newStatus);
                console.log('✅ Availability updated in Firebase');
            } catch (error) {
                console.error('Failed to update availability:', error);
                showNotification('Failed to update status', 'error');
                return;
            }
        }
        
        // Show notification
        const message = newStatus
            ? 'You are now ONLINE! Ready to receive job requests.'
            : 'You are now OFFLINE. You won\'t receive new job requests.';
        showNotification(message, newStatus ? 'success' : 'info');
    });
}


// ========================================
// NOTIFICATION SYSTEM
// ========================================

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
// SMOOTH SCROLL FOR ANCHOR LINKS
// ========================================

document.querySelectorAll('a[href^="#"]:not(#authButton)').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========================================
// ADD ANIMATIONS TO CARDS ON SCROLL
// ========================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all job cards and stat cards
document.querySelectorAll('.job-card, .stat-card, .quick-card, .tip-card').forEach(card => {
    observer.observe(card);
});

// ========================================
// CONSOLE WELCOME MESSAGE
// ========================================

console.log('%c🔧 FixItNow Worker Portal 🔧', 'color: #2563eb; font-size: 20px; font-weight: bold;');
console.log('%cManage jobs, track earnings, grow your business', 'color: #10b981; font-size: 14px;');

// ========================================
// INITIALIZATION
// ========================================

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for auth guard to initialize
    if (window.workerAuthGuard) {
        await window.workerAuthGuard.init();
        updateNavigation();
    }

    // Ensure page is visible even if not authenticated
    document.body.classList.add('auth-checked');

    // Removed: initializeAnimations(); // not needed; animations are already initialized above
});

// Small helper that waits for auth systems to become ready (polls briefly)
window.waitForAuthReady = async function(timeout = 1000) {
    const start = Date.now();
    function check() {
        try {
            if (window.workerAuthGuard && window.workerAuthGuard.isAuthenticated && window.workerAuthGuard.isInitialized) {
                if (window.workerAuthGuard.isAuthenticated()) return true;
            }
            if (window.workerAuth && typeof window.workerAuth.isAuthenticated === 'function') {
                if (window.workerAuth.isAuthenticated()) return true;
            }
            if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) return true;
        } catch (e) { /* ignore */ }
        return false;
    }

    if (check()) return true;

    return new Promise((resolve) => {
        const iv = setInterval(() => {
            if (check()) {
                clearInterval(iv);
                resolve(true);
                return;
            }
            if (Date.now() - start > timeout) {
                clearInterval(iv);
                resolve(false);
            }
        }, 120);
    });
};