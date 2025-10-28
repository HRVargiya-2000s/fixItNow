// ========================================
// FREELANCER/WORKER PORTAL - Main JS
// ========================================

// ========================================
// AUTHENTICATION & USER MANAGEMENT
// ========================================

// Update navigation based on auth status
async function updateNavigation() {
    const authButton = document.getElementById('authButton');

    if (window.workerAuthGuard && window.workerAuthGuard.isAuthenticated()) {
        const user = window.workerAuthGuard.getUser();
        const workerData = window.workerAuthGuard.getWorkerData();

        // Show user avatar or icon
        if (user.profilePicture) {
            authButton.innerHTML = `<img src="${user.profilePicture}" alt="${user.name}" class="user-avatar" title="${user.name}">`;
        } else {
            authButton.innerHTML = '<i class="fas fa-user-circle" style="font-size: 1.5rem;"></i>';
        }

        authButton.title = 'Logout';
        authButton.href = '#';

        // Add logout functionality
        authButton.addEventListener('click', async (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                await window.workerAuthGuard.logout();
            }
        });

        // Update online status if worker data available
        if (workerData && onlineStatusCheckbox) {
            onlineStatusCheckbox.checked = workerData.availability === 'online';
            updateStatusText(workerData.availability === 'online');
        }
    } else {
        // Show login link
        authButton.innerHTML = '<i class="fas fa-user"></i>';
        authButton.title = 'Login';
        authButton.href = 'pages/login.html';
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
// ONLINE/OFFLINE STATUS TOGGLE
// ========================================

const onlineStatusCheckbox = document.getElementById('onlineStatus');
const statusLabel = document.querySelector('.status-label .status-text');

// Make updateStatusText available globally so other functions can call it
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

        // Update status via API if authenticated
        if (window.workerAuthGuard && window.workerAuthGuard.isAuthenticated()) {
            try {
                await window.apiClient.put('/workers/availability', {
                    availability: newStatus ? 'online' : 'offline'
                });
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