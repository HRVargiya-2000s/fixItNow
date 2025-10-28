// ========================================
// QUICK GUIDES - COMPREHENSIVE RESOURCES
// ========================================

const allGuides = [
    // PLUMBING - Videos
    {
        id: 1,
        type: 'video',
        category: 'plumbing',
        title: 'Fix a Leaking Faucet in 5 Minutes',
        description: 'Learn how to repair a dripping faucet quickly and save water. Simple tools required.',
        videoId: 'a7iJRw7lLu8',
        duration: '5:23',
        difficulty: 'easy',
        views: '125K'
    },
    {
        id: 2,
        type: 'video',
        category: 'plumbing',
        title: 'Unclog a Toilet Without a Plunger',
        description: 'Emergency toilet unclogging methods using household items.',
        videoId: 'sdAyfA-fq4Q',
        duration: '4:50',
        difficulty: 'easy',
        views: '298K'
    },
    {
        id: 3,
        type: 'video',
        category: 'plumbing',
        title: 'Install a New Shower Head',
        description: 'Upgrade your bathroom with a new shower head installation.',
        videoId: 'FzbXqpJHPPg',
        duration: '5:55',
        difficulty: 'easy',
        views: '92K'
    },

    // PLUMBING - Articles & Websites
    {
        id: 4,
        type: 'article',
        category: 'plumbing',
        title: 'Complete Guide to Pipe Leak Repair',
        description: 'Comprehensive article covering all types of pipe leaks, from temporary fixes to permanent solutions.',
        url: 'https://www.familyhandyman.com/list/plumbing-fixes/',
        source: 'Family Handyman',
        difficulty: 'medium',
        readTime: '10 min'
    },
    {
        id: 5,
        type: 'website',
        category: 'plumbing',
        title: 'This Old House - Plumbing Projects',
        description: 'Trusted resource with hundreds of plumbing tutorials, videos, and expert advice.',
        url: 'https://www.thisoldhouse.com/plumbing',
        source: 'This Old House',
        difficulty: 'all',
        readTime: 'Browse'
    },

    // PLUMBING - Step-by-Step Tutorials
    {
        id: 6,
        type: 'tutorial',
        category: 'plumbing',
        title: 'Replace a Sink Drain - Step by Step',
        description: 'Detailed walkthrough: 1) Turn off water 2) Remove old drain 3) Clean area 4) Install new drain 5) Test for leaks',
        difficulty: 'medium',
        steps: 5,
        timeRequired: '30-45 min'
    },

    // ELECTRICAL - Videos
    {
        id: 7,
        type: 'video',
        category: 'electrical',
        title: 'Replace a Light Switch Safely',
        description: 'Step-by-step guide to replacing a faulty light switch with safety tips.',
        videoId: 'SPhqBJY3rI0',
        duration: '8:15',
        difficulty: 'medium',
        views: '89K'
    },
    {
        id: 8,
        type: 'video',
        category: 'electrical',
        title: 'Install a Ceiling Fan',
        description: 'Complete installation guide for ceiling fans with wiring instructions.',
        videoId: 'qvlKGr-6fCc',
        duration: '15:20',
        difficulty: 'hard',
        views: '156K'
    },
    {
        id: 9,
        type: 'video',
        category: 'electrical',
        title: 'Fix Flickering Lights',
        description: 'Diagnose and fix flickering light problems in your home.',
        videoId: 'tFgNbCKgMkU',
        duration: '8:20',
        difficulty: 'medium',
        views: '134K'
    },

    // ELECTRICAL - Articles & Websites
    {
        id: 10,
        type: 'article',
        category: 'electrical',
        title: 'Understanding Your Home Electrical Panel',
        description: 'Learn about circuit breakers, fuses, and electrical panel safety with detailed diagrams.',
        url: 'https://www.thespruce.com/electrical-panel-basics-1152925',
        source: 'The Spruce',
        difficulty: 'easy',
        readTime: '8 min'
    },
    {
        id: 11,
        type: 'website',
        category: 'electrical',
        title: 'Electrical Safety Foundation International',
        description: 'Comprehensive electrical safety resources, guides, and professional advice.',
        url: 'https://www.esfi.org',
        source: 'ESFI',
        difficulty: 'all',
        readTime: 'Browse'
    },

    // ELECTRICAL - Tutorials
    {
        id: 12,
        type: 'tutorial',
        category: 'electrical',
        title: 'Install a Dimmer Switch - Complete Guide',
        description: '1) Turn off power at breaker 2) Remove old switch 3) Connect dimmer wires 4) Mount switch 5) Test operation',
        difficulty: 'medium',
        steps: 5,
        timeRequired: '20-30 min'
    },

    // VEHICLE - Videos
    {
        id: 13,
        type: 'video',
        category: 'vehicle',
        title: 'Change Your Car Oil - Complete Guide',
        description: 'DIY oil change tutorial for beginners. Save money on maintenance.',
        videoId: 'O1hF25Cowv8',
        duration: '12:30',
        difficulty: 'medium',
        views: '234K'
    },
    {
        id: 14,
        type: 'video',
        category: 'vehicle',
        title: 'Replace Car Battery',
        description: 'Quick guide to replacing your car battery safely.',
        videoId: 'gUfJcWT-1aY',
        duration: '7:30',
        difficulty: 'easy',
        views: '112K'
    },

    // VEHICLE - Articles & Websites
    {
        id: 15,
        type: 'article',
        category: 'vehicle',
        title: 'DIY Car Maintenance Checklist',
        description: 'Essential maintenance tasks every car owner should know how to do themselves.',
        url: 'https://www.popularmechanics.com/cars/car-technology/a258/1275771/',
        source: 'Popular Mechanics',
        difficulty: 'easy',
        readTime: '12 min'
    },
    {
        id: 16,
        type: 'website',
        category: 'vehicle',
        title: 'ChrisFix - Auto Repair Channel',
        description: 'Professional mechanic sharing detailed car repair tutorials and tips.',
        url: 'https://www.youtube.com/@chrisfix',
        source: 'YouTube Channel',
        difficulty: 'all',
        readTime: 'Browse'
    },

    // VEHICLE - Tutorials
    {
        id: 17,
        type: 'tutorial',
        category: 'vehicle',
        title: 'Change a Flat Tire - Emergency Guide',
        description: '1) Park safely 2) Loosen lug nuts 3) Jack up car 4) Remove flat 5) Install spare 6) Lower car 7) Tighten nuts',
        difficulty: 'easy',
        steps: 7,
        timeRequired: '15-20 min'
    },

    // APPLIANCE - Videos
    {
        id: 18,
        type: 'video',
        category: 'appliance',
        title: 'Unclog a Washing Machine Drain',
        description: 'Fix drainage issues in your washing machine without calling a technician.',
        videoId: '9BXNMu3x_RU',
        duration: '6:45',
        difficulty: 'easy',
        views: '67K'
    },
    {
        id: 19,
        type: 'video',
        category: 'appliance',
        title: 'Fix a Refrigerator Not Cooling',
        description: 'Troubleshoot and repair common refrigerator cooling problems.',
        videoId: 'c3QF_GOAkME',
        duration: '11:40',
        difficulty: 'hard',
        views: '178K'
    },

    // APPLIANCE - Articles & Websites
    {
        id: 20,
        type: 'article',
        category: 'appliance',
        title: 'Dishwasher Troubleshooting Guide',
        description: 'Common dishwasher problems and how to fix them without calling for service.',
        url: 'https://www.consumerreports.org/appliances/dishwashers/how-to-fix-dishwasher-problems/',
        source: 'Consumer Reports',
        difficulty: 'medium',
        readTime: '15 min'
    },
    {
        id: 21,
        type: 'website',
        category: 'appliance',
        title: 'RepairClinic - Appliance Parts & Guides',
        description: 'Find parts, manuals, and repair guides for all major appliance brands.',
        url: 'https://www.repairclinic.com',
        source: 'RepairClinic',
        difficulty: 'all',
        readTime: 'Browse'
    },

    // FURNITURE - Videos
    {
        id: 22,
        type: 'video',
        category: 'furniture',
        title: 'Repair Broken Chair Leg',
        description: 'Fix wooden furniture legs with simple woodworking techniques.',
        videoId: 'XUMfS8gJTs0',
        duration: '9:15',
        difficulty: 'medium',
        views: '45K'
    },
    {
        id: 23,
        type: 'video',
        category: 'furniture',
        title: 'Remove Scratches from Wood Furniture',
        description: 'Restore wooden furniture by removing scratches and marks.',
        videoId: 'VXRUWjKiQQc',
        duration: '6:10',
        difficulty: 'easy',
        views: '76K'
    },

    // FURNITURE - Articles & Tutorials
    {
        id: 24,
        type: 'article',
        category: 'furniture',
        title: 'Furniture Refinishing for Beginners',
        description: 'Complete guide to stripping, sanding, staining, and finishing wooden furniture.',
        url: 'https://www.bobvila.com/articles/how-to-refinish-furniture/',
        source: 'Bob Vila',
        difficulty: 'medium',
        readTime: '18 min'
    },
    {
        id: 25,
        type: 'tutorial',
        category: 'furniture',
        title: 'Tighten Loose Furniture Joints',
        description: '1) Remove old glue 2) Clean surfaces 3) Apply wood glue 4) Clamp tightly 5) Let dry 24 hours',
        difficulty: 'easy',
        steps: 5,
        timeRequired: '30 min + drying'
    },

    // HVAC - Videos & Articles
    {
        id: 26,
        type: 'video',
        category: 'hvac',
        title: 'Clean Your AC Filter - Save Energy',
        description: 'Simple AC maintenance that improves efficiency and air quality.',
        videoId: '3K8vfVwi4V4',
        duration: '4:30',
        difficulty: 'easy',
        views: '156K'
    },
    {
        id: 27,
        type: 'article',
        category: 'hvac',
        title: 'HVAC Maintenance Schedule',
        description: 'Seasonal maintenance tasks to keep your heating and cooling systems running efficiently.',
        url: 'https://www.energy.gov/energysaver/maintaining-your-air-conditioner',
        source: 'Energy.gov',
        difficulty: 'easy',
        readTime: '10 min'
    },
    {
        id: 28,
        type: 'tutorial',
        category: 'hvac',
        title: 'Replace Thermostat Batteries',
        description: '1) Remove thermostat cover 2) Note battery type 3) Remove old batteries 4) Install new ones 5) Reset settings',
        difficulty: 'easy',
        steps: 5,
        timeRequired: '5-10 min'
    }
];

// Current filters
let currentCategory = 'all';
let currentType = 'all';
let currentDifficulty = 'all';
let searchQuery = '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    displayGuides();
    setupFilters();
    setupSearch();
    setupModal();
});

// Display guides
function displayGuides() {
    const grid = document.getElementById('guidesGrid');
    const emptyState = document.getElementById('emptyState');
    
    let filtered = allGuides.filter(guide => {
        const matchesCategory = currentCategory === 'all' || guide.category === currentCategory;
        const matchesType = currentType === 'all' || guide.type === currentType;
        const matchesDifficulty = currentDifficulty === 'all' || guide.difficulty === currentDifficulty || guide.difficulty === 'all';
        const matchesSearch = !searchQuery || 
            guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            guide.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesType && matchesDifficulty && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    emptyState.style.display = 'none';

    grid.innerHTML = filtered.map(guide => createGuideCard(guide)).join('');
}

// Create guide card with enhanced styling and thumbnails
function createGuideCard(guide) {
    const typeIcons = {
        video: 'fa-play-circle',
        article: 'fa-file-alt',
        website: 'fa-globe',
        tutorial: 'fa-list-ol'
    };

    const typeLabels = {
        video: 'Video',
        article: 'Article',
        website: 'Website',
        tutorial: 'Tutorial'
    };

    const categoryIcons = {
        electrical: 'fa-bolt',
        plumbing: 'fa-faucet',
        vehicle: 'fa-car',
        furniture: 'fa-couch',
        appliance: 'fa-blender',
        hvac: 'fa-fan'
    };

    let metaInfo = '';
    if (guide.type === 'video') {
        metaInfo = `<span><i class="far fa-clock"></i> ${guide.duration}</span>
                   <span><i class="fas fa-eye"></i> ${guide.views}</span>`;
    } else if (guide.type === 'article' || guide.type === 'website') {
        metaInfo = `<span><i class="far fa-clock"></i> ${guide.readTime}</span>
                   <span><i class="fas fa-external-link-alt"></i> ${guide.source}</span>`;
    } else if (guide.type === 'tutorial') {
        metaInfo = `<span><i class="fas fa-tasks"></i> ${guide.steps} steps</span>
                   <span><i class="far fa-clock"></i> ${guide.timeRequired}</span>`;
    }

    const clickAction = guide.type === 'video' 
        ? `onclick="openVideo('${guide.videoId}')"` 
        : guide.type === 'tutorial'
        ? `onclick="showTutorial(${guide.id})"`
        : `onclick="window.open('${guide.url}', '_blank')"`;

    // Generate thumbnail based on type
    let thumbnailHTML = '';
    if (guide.type === 'video') {
        // YouTube thumbnail
        const thumbnailUrl = `https://img.youtube.com/vi/${guide.videoId}/mqdefault.jpg`;
        thumbnailHTML = `
            <div class="guide-thumbnail">
                <img src="${thumbnailUrl}" alt="${guide.title}" loading="lazy">
                <div class="play-overlay">
                    <i class="fas fa-play"></i>
                </div>
                <div class="duration-badge">${guide.duration}</div>
            </div>
        `;
    } else {
        // Icon-based thumbnail for non-video content
        const gradients = {
            electrical: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            plumbing: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            vehicle: 'linear-gradient(135deg, #ef4444, #dc2626)',
            furniture: 'linear-gradient(135deg, #f59e0b, #d97706)',
            appliance: 'linear-gradient(135deg, #10b981, #059669)',
            hvac: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
        };
        
        thumbnailHTML = `
            <div class="guide-thumbnail" style="background: ${gradients[guide.category]}; display: flex; align-items: center; justify-content: center;">
                <i class="fas ${categoryIcons[guide.category]}" style="font-size: 4rem; color: rgba(255,255,255,0.9);"></i>
            </div>
        `;
    }

    return `
        <div class="category-card" ${clickAction}>
            ${thumbnailHTML}
            <div class="guide-type-badge">
                <i class="fas ${typeIcons[guide.type]}"></i> ${typeLabels[guide.type]}
            </div>
            <div class="guide-difficulty-badge difficulty-${guide.difficulty}">
                ${guide.difficulty}
            </div>
            <div style="padding: 1.5rem;">
                <h3>${guide.title}</h3>
                <p>${guide.description}</p>
                <div class="guide-meta-info">
                    ${metaInfo}
                </div>
                <div class="card-footer">
                    <span class="guide-count">${guide.category}</span>
                    <span class="card-btn">
                        ${guide.type === 'video' ? 'Watch Now' : guide.type === 'tutorial' ? 'View Steps' : 'Read More'} 
                        <i class="fas fa-arrow-right"></i>
                    </span>
                </div>
            </div>
        </div>
    `;
}

// Setup filters
function setupFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const typeFilter = document.getElementById('typeFilter');
    const difficultyFilter = document.getElementById('difficultyFilter');

    categoryFilter.addEventListener('change', (e) => {
        currentCategory = e.target.value;
        displayGuides();
    });

    typeFilter.addEventListener('change', (e) => {
        currentType = e.target.value;
        displayGuides();
    });

    difficultyFilter.addEventListener('change', (e) => {
        currentDifficulty = e.target.value;
        displayGuides();
    });
}

// Setup search
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        displayGuides();
    });
}

// Video modal
function setupModal() {
    const modal = document.getElementById('videoModal');
    const closeBtn = document.getElementById('closeModal');
    
    closeBtn.addEventListener('click', closeVideo);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeVideo();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeVideo();
        }
    });
}

function openVideo(videoId) {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoFrame');
    
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeVideo() {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoFrame');
    
    iframe.src = '';
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function showTutorial(id) {
    const guide = allGuides.find(g => g.id === id);
    if (guide) {
        alert(`${guide.title}\n\n${guide.description}\n\nDifficulty: ${guide.difficulty}\nTime Required: ${guide.timeRequired}\n\nThis would open a detailed step-by-step view in a production app.`);
    }
}
