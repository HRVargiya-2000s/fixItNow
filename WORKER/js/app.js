// FixItNow - Main App Logic
const FixItNowApp = {
    currentUser: null,
    theme: localStorage.getItem('theme') || 'dark',

    // Initialize app
    init() {
        this.setupTheme();
        this.setupNavbar();
        this.setupAuth();
        console.log('✅ FixItNow App Initialized');
    },

    // Setup theme
    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    },

    // Toggle theme
    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', this.theme);
        document.documentElement.setAttribute('data-theme', this.theme);
        
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    },

    // Setup navbar
    setupNavbar() {
        // Hamburger menu
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.querySelector('.nav-links');
        
        if (hamburger && navLinks) {
            hamburger.addEventListener('click', (e) => {
                e.stopPropagation();
                navLinks.classList.toggle('active');
                const icon = hamburger.querySelector('i');
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.nav-container')) {
                    navLinks.classList.remove('active');
                    const icon = hamburger.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        }

        // User menu dropdown
        const userBtn = document.getElementById('userBtn');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userBtn && userDropdown) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('active');
            });

            document.addEventListener('click', () => {
                userDropdown.classList.remove('active');
            });
        }

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
        });

        // Active nav link
        this.setActiveNavLink();
    },

    // Set active nav link based on current page
    setActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-links a');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    },

    // Setup authentication
    setupAuth() {
        if (typeof auth !== 'undefined') {
            auth.onAuthStateChanged(async (user) => {
                this.currentUser = user;
                this.updateUserUI(user);
            });
        }

        // Logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (confirm('Are you sure you want to logout?')) {
                    try {
                        await auth.signOut();
                        window.location.href = 'login.html';
                    } catch (error) {
                        console.error('Logout error:', error);
                    }
                }
            });
        }
    },

    // Update user UI
    updateUserUI(user) {
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const userBtn = document.getElementById('userBtn');

        if (user) {
            if (userName) userName.textContent = user.displayName || 'User';
            if (userEmail) userEmail.textContent = user.email;
            if (userBtn) userBtn.style.display = 'flex';

            // Load additional user data from Firestore
            if (typeof db !== 'undefined') {
                db.collection('users').doc(user.uid).get().then(doc => {
                    if (doc.exists && userName) {
                        userName.textContent = doc.data().fullName || user.displayName || 'User';
                    }
                });
            }
        } else {
            if (userBtn) userBtn.style.display = 'none';
        }
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    FixItNowApp.init();
});

// Make globally available
window.FixItNowApp = FixItNowApp;
