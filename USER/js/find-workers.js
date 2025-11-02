// ========================================
// FIND WORKERS - FILTER & SEARCH LOGIC
// ========================================

// Sample workers data (in production, this would come from API)
const workersData = [
    {
        id: 1,
        name: 'John Smith',
        category: 'electrical',
        specialty: 'Electrical Expert',
        rating: 5.0,
        reviews: 142,
        experience: 5,
        jobsCompleted: 250,
        hourlyRate: 45,
        price: 'medium',
        skills: ['Wiring', 'Outlets', 'Lighting'],
        available: true,
        verified: true,
        topRated: false,
        avatar: 'https://ui-avatars.com/api/?name=John+Smith&size=120&background=2563eb&color=fff'
    },
    {
        id: 2,
        name: 'Maria Garcia',
        category: 'plumbing',
        specialty: 'Plumbing Specialist',
        rating: 5.0,
        reviews: 98,
        experience: 8,
        jobsCompleted: 320,
        hourlyRate: 50,
        price: 'medium',
        skills: ['Faucets', 'Pipes', 'Drains'],
        available: false,
        verified: true,
        topRated: false,
        avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&size=120&background=10b981&color=fff'
    },
    {
        id: 3,
        name: 'David Lee',
        category: 'vehicle',
        specialty: 'Auto Mechanic',
        rating: 4.8,
        reviews: 215,
        experience: 12,
        jobsCompleted: 500,
        hourlyRate: 65,
        price: 'high',
        skills: ['Oil Change', 'Brakes', 'Engine'],
        available: true,
        verified: true,
        topRated: true,
        avatar: 'https://ui-avatars.com/api/?name=David+Lee&size=120&background=ef4444&color=fff'
    }
];

let filteredWorkers = [...workersData];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupFilters();
    setupSort();
    setupWorkerActions();
    renderWorkers(filteredWorkers);
});

// Setup Filters
function setupFilters() {
    const applyBtn = document.getElementById('applyFilters');
    const resetBtn = document.getElementById('resetFilters');

    if (applyBtn) {
        applyBtn.addEventListener('click', applyFilters);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
}

function applyFilters() {
    const category = document.getElementById('categoryFilter').value;
    const rating = document.getElementById('ratingFilter').value;
    const price = document.getElementById('priceFilter').value;
    const location = document.getElementById('locationFilter').value;
    const availability = document.getElementById('availabilityFilter').value;

    filteredWorkers = workersData.filter(worker => {
        // Category filter
        if (category !== 'all' && worker.category !== category) return false;

        // Rating filter
        if (rating !== 'all') {
            const minRating = parseInt(rating);
            if (worker.rating < minRating) return false;
        }

        // Price filter
        if (price !== 'all' && worker.price !== price) return false;

        // Availability filter
        if (availability === 'immediate' && !worker.available) return false;

        return true;
    });

    renderWorkers(filteredWorkers);
    updateResultsCount();
}

function resetFilters() {
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('ratingFilter').value = 'all';
    document.getElementById('priceFilter').value = 'all';
    document.getElementById('locationFilter').value = '';
    document.getElementById('availabilityFilter').value = 'all';

    filteredWorkers = [...workersData];
    renderWorkers(filteredWorkers);
    updateResultsCount();
}

// Setup Sort
function setupSort() {
    const sortSelect = document.getElementById('sortBy');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortWorkers(e.target.value);
        });
    }
}

function sortWorkers(sortBy) {
    switch (sortBy) {
        case 'rating':
            filteredWorkers.sort((a, b) => b.rating - a.rating);
            break;
        case 'reviews':
            filteredWorkers.sort((a, b) => b.reviews - a.reviews);
            break;
        case 'price-low':
            filteredWorkers.sort((a, b) => a.hourlyRate - b.hourlyRate);
            break;
        case 'price-high':
            filteredWorkers.sort((a, b) => b.hourlyRate - a.hourlyRate);
            break;
        case 'experience':
            filteredWorkers.sort((a, b) => b.experience - a.experience);
            break;
    }

    renderWorkers(filteredWorkers);
}

// Render Workers
function renderWorkers(workers) {
    const grid = document.getElementById('workersGrid');
    
    if (!grid) return;

    if (workers.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-user-slash" style="font-size: 4rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                <h3 style="color: var(--text-secondary);">No workers found</h3>
                <p style="color: var(--text-light);">Try adjusting your filters</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = workers.map(worker => createWorkerCard(worker)).join('');
    setupWorkerActions();
}

function createWorkerCard(worker) {
    const stars = generateStars(worker.rating);
    const badges = generateBadges(worker);

    return `
        <div class="worker-card" data-category="${worker.category}" data-rating="${Math.floor(worker.rating)}" data-price="${worker.price}">
            ${badges}
            
            <div class="worker-avatar">
                <img src="${worker.avatar}" alt="${worker.name}">
            </div>

            <div class="worker-info">
                <h3>${worker.name}</h3>
                <p class="worker-specialty">
                    <i class="${getCategoryIcon(worker.category)}"></i> ${worker.specialty}
                </p>

                <div class="worker-rating">
                    <div class="stars">${stars}</div>
                    <span>${worker.rating.toFixed(1)} (${worker.reviews} reviews)</span>
                </div>

                <div class="worker-stats">
                    <div class="stat">
                        <i class="fas fa-briefcase"></i>
                        <span>${worker.experience} years exp</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-tasks"></i>
                        <span>${worker.jobsCompleted}+ jobs</span>
                    </div>
                </div>

                <div class="worker-price">
                    <span class="price-label">Starting at</span>
                    <span class="price-amount">$${worker.hourlyRate}/hr</span>
                </div>

                <div class="worker-skills">
                    ${worker.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>

                <div class="worker-actions">
                    <button class="btn-secondary btn-view-profile" data-worker-id="${worker.id}">
                        <i class="fas fa-user"></i> View Profile
                    </button>
                    <button class="btn-primary btn-hire" data-worker-id="${worker.id}">
                        <i class="fas fa-handshake"></i> Hire Now
                    </button>
                </div>
            </div>
        </div>
    `;
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }

    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }

    return stars;
}

function generateBadges(worker) {
    let badges = '';

    if (worker.verified) {
        badges += `
            <div class="worker-badge verified">
                <i class="fas fa-check-circle"></i> Verified
            </div>
        `;
    }

    if (worker.available) {
        badges += `
            <div class="worker-badge available">
                <i class="fas fa-circle"></i> Available
            </div>
        `;
    }

    if (worker.topRated) {
        badges += `
            <div class="worker-badge top-rated">
                <i class="fas fa-crown"></i> Top Rated
            </div>
        `;
    }

    return badges;
}

function getCategoryIcon(category) {
    const icons = {
        electrical: 'fas fa-bolt',
        plumbing: 'fas fa-faucet',
        vehicle: 'fas fa-car',
        furniture: 'fas fa-couch',
        appliance: 'fas fa-blender',
        hvac: 'fas fa-fan'
    };
    return icons[category] || 'fas fa-tools';
}

function updateResultsCount() {
    const countElement = document.getElementById('resultsCount');
    if (countElement) {
        countElement.textContent = filteredWorkers.length;
    }
}

// Setup Worker Actions
function setupWorkerActions() {
    // View Profile buttons
    document.querySelectorAll('.btn-view-profile').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const workerId = e.currentTarget.getAttribute('data-worker-id');
            viewWorkerProfile(workerId);
        });
    });

    // Hire buttons
    document.querySelectorAll('.btn-hire').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const workerId = e.currentTarget.getAttribute('data-worker-id');
            hireWorker(workerId);
        });
    });
}

function viewWorkerProfile(workerId) {
    const worker = workersData.find(w => w.id == workerId);
    if (worker) {
        alert(`Viewing profile of ${worker.name}\n\nThis will open a detailed profile page with:\n- Full bio\n- Portfolio\n- Reviews\n- Availability calendar`);
        // In production: window.location.href = `worker-profile.html?id=${workerId}`;
    }
}

function hireWorker(workerId) {
    const worker = workersData.find(w => w.id == workerId);
    if (worker) {
        const confirm = window.confirm(`Hire ${worker.name} for $${worker.hourlyRate}/hr?\n\nYou will be directed to create a job request.`);
        if (confirm) {
            // In production: redirect to job creation with pre-selected worker
            window.location.href = 'report-issue.html';
        }
    }
}
