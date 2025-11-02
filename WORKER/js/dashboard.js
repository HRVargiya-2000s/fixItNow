// ========================================
// WORKER DASHBOARD - FIREBASE VERSION
// ========================================

// Load dashboard data when page loads
async function loadDashboardData() {
    if (!window.workerAuth || !window.workerAuth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const workerData = window.workerAuth.getWorkerData();
        
        if (!workerData) {
            console.error('No worker data found');
            return;
        }

        // Update stats display
        updateStatsDisplay({
            newRequests: workerData.newRequests || 0,
            ongoingJobs: workerData.ongoingJobs || 0,
            completedJobs: workerData.completedJobs || 0,
            rating: workerData.rating || 0
        });

        // Load recent job requests from Firestore
        loadRecentIssues(workerData.categories);
        
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

// Update statistics display
function updateStatsDisplay(stats) {
    const newRequestsCount = document.getElementById('newRequestsCount');
    const ongoingJobsCount = document.getElementById('ongoingJobsCount');
    const completedJobsCount = document.getElementById('completedJobsCount');
    const ratingScore = document.getElementById('ratingScore');

    if (newRequestsCount) newRequestsCount.textContent = stats.newRequests;
    if (ongoingJobsCount) ongoingJobsCount.textContent = stats.ongoingJobs;
    if (completedJobsCount) completedJobsCount.textContent = stats.completedJobs;
    if (ratingScore) ratingScore.textContent = stats.rating.toFixed(1);
}

// Load recent issues from Firestore
async function loadRecentIssues(categories) {
    if (!categories || categories.length === 0) {
        console.log('No categories assigned to worker');
        return;
    }

    try {
        // Get issues matching worker's categories
        const issuesSnapshot = await db.collection('issues')
            .where('category', 'in', categories)
            .where('status', '==', 'pending')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();

        const issues = issuesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        updateIssuesDisplay(issues);
    } catch (error) {
        console.error('Error loading recent issues:', error);
    }
}

// Update issues display
function updateIssuesDisplay(issues) {
    // Implement based on your HTML structure
    console.log('Recent issues:', issues);
}

// Show notification
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
}

// Initialize dashboard when DOM loads
document.addEventListener('DOMContentLoaded', async () => {
    await window.workerAuth.init();
    loadDashboardData();
});

console.log('✅ Dashboard.js loaded (Firebase version)');
    