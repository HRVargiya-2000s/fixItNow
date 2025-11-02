// ========================================
// WORKER DASHBOARD FUNCTIONALITY
// ========================================

// Load dashboard data when page loads
async function loadDashboardData() {
    if (!window.workerAuthGuard || !window.workerAuthGuard.isAuthenticated()) {
        return;
    }

    try {
        // Load worker stats
        const statsResponse = await window.apiClient.get('/workers/stats');
        updateStatsDisplay(statsResponse.stats);

        // Load recent issues
        const issuesResponse = await window.apiClient.get('/workers/issues?limit=5');
        updateIssuesDisplay(issuesResponse.issues);

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

    if (newRequestsCount) newRequestsCount.textContent = stats.newRequests || 0;
    if (ongoingJobsCount) ongoingJobsCount.textContent = stats.activeIssues || 0;
    if (completedJobsCount) completedJobsCount.textContent = stats.completedIssues || 0;
    if (ratingScore) ratingScore.textContent = stats.rating ? stats.rating.toFixed(1) : '0.0';
}

// Update issues display
function updateIssuesDisplay(issues) {
    const newBadge = document.getElementById('newBadge');
    const activeBadge = document.getElementById('activeBadge');

    if (newBadge) {
        const newCount = issues.filter(issue => issue.status === 'pending').length;
        newBadge.textContent = newCount > 0 ? `${newCount} New` : '0 New';
    }

    if (activeBadge) {
        const activeCount = issues.filter(issue => ['accepted', 'in_progress'].includes(issue.status)).length;
        activeBadge.textContent = activeCount > 0 ? `${activeCount} Active` : '0 Active';
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load dashboard data after auth guard initializes
    setTimeout(loadDashboardData, 1000);

    // Refresh data every 30 seconds
    setInterval(loadDashboardData, 30000);
});