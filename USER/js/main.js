window.addEventListener("error", (e) => {
    if (e.message.includes("translate-page") || e.message.includes("save-page")) {
        e.preventDefault();
    }
});

// ========================================
// THEME TOGGLE (Light/Dark Mode)
// ========================================

const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

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

// ========================================
// AUTHENTICATION & USER MANAGEMENT
// ========================================

// Update navigation based on auth status
async function updateNavigation() {
    const loginLink = document.querySelector('.btn-nav-login');

    if (window.authGuard && window.authGuard.isAuthenticated()) {
        const user = window.authGuard.getUser();

        // Show user avatar or icon
        if (user.profilePicture) {
            loginLink.innerHTML = `<img src="${user.profilePicture}" alt="${user.name}" class="user-avatar" title="${user.name}">`;
        } else {
            loginLink.innerHTML = '<i class="fas fa-user-circle" style="font-size: 1.5rem;"></i>';
        }

        loginLink.title = 'Profile';
        loginLink.href = 'pages/my-issues.html'; // Redirect to profile/issues page

        // Add logout option on click
        loginLink.addEventListener('click', async (e) => {
            if (e.target.closest('.user-avatar') || e.target.classList.contains('fa-user-circle')) {
                e.preventDefault();
                if (confirm('Are you sure you want to logout?')) {
                    await window.authGuard.logout();
                }
            }
        });
    } else {
        // Show login link
        loginLink.innerHTML = '<i class="fas fa-user"></i>';
        loginLink.title = 'Login';
        loginLink.href = 'pages/login.html';
    }
}

// ========================================
// MOBILE NAVIGATION TOGGLE
// ========================================

const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle) {
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
// SEARCH FUNCTIONALITY WITH SUGGESTIONS
// ========================================

const searchInput = document.getElementById('searchInput');
const searchSuggestions = document.getElementById('searchSuggestions');

// Sample repair guides data
const repairGuides = [
    { title: 'Fix a Leaking Faucet', category: 'plumbing', difficulty: 'easy' },
    { title: 'Replace Light Switch', category: 'electrical', difficulty: 'easy' },
    { title: 'Change a Flat Tire', category: 'vehicle', difficulty: 'easy' },
    { title: 'Unclog a Drain', category: 'plumbing', difficulty: 'easy' },
    { title: 'Replace Outlet', category: 'electrical', difficulty: 'medium' },
    { title: 'Fix Running Toilet', category: 'plumbing', difficulty: 'medium' },
    { title: 'Change Car Oil', category: 'vehicle', difficulty: 'medium' },
    { title: 'Replace Car Battery', category: 'vehicle', difficulty: 'easy' },
    { title: 'Fix Squeaky Door Hinge', category: 'furniture', difficulty: 'easy' },
    { title: 'Repair Refrigerator', category: 'appliance', difficulty: 'advanced' },
    { title: 'Install Ceiling Fan', category: 'electrical', difficulty: 'advanced' },
    { title: 'Fix AC Not Cooling', category: 'hvac', difficulty: 'medium' },
];

if (searchInput && searchSuggestions) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length === 0) {
            searchSuggestions.classList.remove('active');
            searchSuggestions.innerHTML = '';
            return;
        }
        
        // Filter guides based on query
        const matches = repairGuides.filter(guide => 
            guide.title.toLowerCase().includes(query) ||
            guide.category.toLowerCase().includes(query)
        );
        
        if (matches.length > 0) {
            searchSuggestions.innerHTML = matches
                .slice(0, 5) // Show max 5 suggestions
                .map(guide => `
                    <div class="suggestion-item" data-category="${guide.category}">
                        <i class="fas fa-search"></i> ${guide.title}
                        <span style="float: right; color: var(--text-light); font-size: 0.85rem;">
                            ${guide.difficulty}
                        </span>
                    </div>
                `)
                .join('');
            
            searchSuggestions.classList.add('active');
            
            // Add click event to suggestions
            document.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', () => {
                    const category = item.getAttribute('data-category');
                    window.location.href = `pages/repair-guide.html?category=${category}`;
                });
            });
        } else {
            searchSuggestions.innerHTML = `
                <div class="suggestion-item">
                    <i class="fas fa-info-circle"></i> No results found
                </div>
            `;
            searchSuggestions.classList.add('active');
        }
    });
    
    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            searchSuggestions.classList.remove('active');
        }
    });
}

// ========================================
// CATEGORY & DIFFICULTY FILTERS
// ========================================

const categoryFilter = document.getElementById('categoryFilter');
const difficultyFilter = document.getElementById('difficultyFilter');
const categoryGrid = document.getElementById('categoryGrid');

if (categoryFilter && difficultyFilter && categoryGrid) {
    categoryFilter.addEventListener('change', filterCards);
    difficultyFilter.addEventListener('change', filterCards);
}

function filterCards() {
    const selectedCategory = categoryFilter.value;
    const selectedDifficulty = difficultyFilter.value;
    const cards = categoryGrid.querySelectorAll('.category-card');
    
    cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        const cardDifficulty = card.getAttribute('data-difficulty');
        
        const categoryMatch = selectedCategory === 'all' || cardCategory === selectedCategory;
        const difficultyMatch = selectedDifficulty === 'all' || cardDifficulty === selectedDifficulty;
        
        if (categoryMatch && difficultyMatch) {
            card.style.display = 'block';
            card.classList.add('fade-in');
        } else {
            card.style.display = 'none';
        }
    });
}

// ========================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
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
// CARD HOVER ANIMATIONS
// ========================================

const cards = document.querySelectorAll('.category-card');
cards.forEach((card, index) => {
    // Stagger animation on load
    card.style.animationDelay = `${index * 0.1}s`;
    
    // Add 3D tilt effect on hover (optional enhancement)
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// ========================================
// CONSOLE WELCOME MESSAGE
// ========================================

console.log('%c🔧 Welcome to FixItNow! 🔧', 'color: #2563eb; font-size: 20px; font-weight: bold;');
console.log('%cEmpowering self-reliance through visual repair guides', 'color: #10b981; font-size: 14px;');

// ========================================
// INITIALIZATION
// ========================================

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for auth guard to initialize
    if (window.authGuard) {
        await window.authGuard.init();
        updateNavigation();
    }

    // Initialize other features
    initializeSearch();
    initializeFilters();
    // initializeAnimations();
});

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');

    if (!searchInput || !searchSuggestions) return;

    // Sample repair guides data (will be replaced with API call)
    const repairGuides = [
        { title: 'Fix a Leaking Faucet', category: 'plumbing', difficulty: 'easy' },
        { title: 'Replace Light Switch', category: 'electrical', difficulty: 'easy' },
        { title: 'Change a Flat Tire', category: 'vehicle', difficulty: 'easy' },
        { title: 'Unclog a Drain', category: 'plumbing', difficulty: 'easy' },
        { title: 'Replace Outlet', category: 'electrical', difficulty: 'medium' },
        { title: 'Fix Running Toilet', category: 'plumbing', difficulty: 'medium' },
        { title: 'Change Car Oil', category: 'vehicle', difficulty: 'medium' },
        { title: 'Replace Car Battery', category: 'vehicle', difficulty: 'easy' },
        { title: 'Fix Squeaky Door Hinge', category: 'furniture', difficulty: 'easy' },
        { title: 'Repair Refrigerator', category: 'appliance', difficulty: 'advanced' },
        { title: 'Install Ceiling Fan', category: 'electrical', difficulty: 'advanced' },
        { title: 'Fix AC Not Cooling', category: 'hvac', difficulty: 'medium' },
    ];

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        if (query.length === 0) {
            searchSuggestions.classList.remove('active');
            searchSuggestions.innerHTML = '';
            return;
        }

        // Filter guides based on query
        const matches = repairGuides.filter(guide =>
            guide.title.toLowerCase().includes(query) ||
            guide.category.toLowerCase().includes(query)
        );

        if (matches.length > 0) {
            searchSuggestions.innerHTML = matches
                .slice(0, 5) // Show max 5 suggestions
                .map(guide => `
                    <div class="suggestion-item" data-category="${guide.category}">
                        <i class="fas fa-search"></i> ${guide.title}
                        <span style="float: right; color: var(--text-light); font-size: 0.85rem;">
                            ${guide.difficulty}
                        </span>
                    </div>
                `)
                .join('');

            searchSuggestions.classList.add('active');

            // Add click event to suggestions
            document.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', () => {
                    const category = item.getAttribute('data-category');
                    window.location.href = `pages/repair-guide.html?category=${category}`;
                });
            });
        } else {
            searchSuggestions.innerHTML = `
                <div class="suggestion-item">
                    <i class="fas fa-info-circle"></i> No results found
                </div>
            `;
            searchSuggestions.classList.add('active');
        }
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            searchSuggestions.classList.remove('active');
        }
    });
}

// Initialize filters
function initializeFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const difficultyFilter = document.getElementById('difficultyFilter');
    const categoryGrid = document.getElementById('categoryGrid');

    if (!categoryFilter || !difficultyFilter || !categoryGrid) return;

    const filterCards = () => {
        const selectedCategory = categoryFilter.value;
        const selectedDifficulty = difficultyFilter.value;
        const cards = categoryGrid.querySelectorAll('.category-card');

        cards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            const cardDifficulty = card.getAttribute('data-difficulty');

            const categoryMatch = selectedCategory === 'all' || cardCategory === selectedCategory;
            const difficultyMatch = selectedDifficulty === 'all' || cardDifficulty === selectedDifficulty;

            if (categoryMatch && difficultyMatch) {
                card.style.display = 'block';
                card.classList.add('fade-in');
            } else {
                card.style.display = 'none';
            }
        });
    };

    categoryFilter.addEventListener('change', filterCards);
    difficultyFilter.addEventListener('change', filterCards);
}

// Initialize animations
function initializeAnimations() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
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

    // Card hover animations
    const cards = document.querySelectorAll('.category-card');
    cards.forEach((card, index) => {
        // Stagger animation on load
        card.style.animationDelay = `${index * 0.1}s`;

        // Add 3D tilt effect on hover
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}
