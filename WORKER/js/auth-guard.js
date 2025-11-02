// Authentication Guard for Workers
class WorkerAuthGuard {
  constructor() {
    this.user = null;
    this.workerProfile = null;
    this.isInitialized = false;
  }

  // Initialize auth guard
  async init() {
    if (this.isInitialized) return;

    try {
      console.log('[workerAuthGuard] init: checking apiClient...');
      if (window.apiClient && window.apiClient.isAuthenticated()) {
        const response = await window.apiClient.getCurrentUser();
        this.user = response.user;
        this.workerProfile = response.workerProfile;
        console.log('[workerAuthGuard] init: user loaded', this.user && this.user.email);
      } else {
        console.log('[workerAuthGuard] init: no apiClient or not authenticated');
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Do not force logout/redirect here; let the auth-check handle redirects.
      this.user = null;
      this.workerProfile = null;
    }

    this.isInitialized = true;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!(this.user && window.apiClient && window.apiClient.isAuthenticated());
  }

  // Get current user
  getUser() {
    return this.user;
  }

  // Get worker profile
  getWorkerData() {
    return this.workerProfile;
  }

  // Check if user is worker
  isWorker() {
    return this.user && this.user.role === 'worker';
  }

  // Check if user is admin
  isAdmin() {
    return this.user && this.user.role === 'admin';
  }

  // Login user
  async login(credentials) {
    try {
      const response = await window.apiClient.login(credentials);
      this.user = response.user;
      this.workerProfile = response.workerProfile;
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Register user
  async register(userData) {
    try {
      const response = await window.apiClient.register(userData);
      this.user = response.user;
      this.workerProfile = response.workerProfile;
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      await window.apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }

    this.user = null;
    this.workerProfile = null;
    // Clear any just-logged-in flag and redirect to the proper login path
    try { sessionStorage.removeItem('justLoggedIn') } catch (e) {}
    const target = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
    console.log('[workerAuthGuard] logout -> redirecting to', target);
    window.location.replace(target);
  }

  // Require authentication for a page
  requireAuth() {
    if (!this.isAuthenticated()) {
      const target = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
      window.location.replace(target);
      return false;
    }
    return true;
  }

  // Require worker role
  requireWorker() {
    if (!this.requireAuth()) return false;

    if (!this.isWorker()) {
      alert('This page requires worker access');
      const target = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
      window.location.replace(target);
      return false;
    }
    return true;
  }

  // Require admin role
  requireAdmin() {
    if (!this.requireAuth()) return false;

    if (!this.isAdmin()) {
      alert('This page requires admin access');
      const target = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
      window.location.replace(target);
      return false;
    }
    return true;
  }

  // Redirect based on user role
  redirectBasedOnRole() {
    if (!this.isAuthenticated()) {
      const target = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
      window.location.replace(target);
      return;
    }

    if (this.isAdmin()) {
      // Admin dashboard (to be implemented)
      window.location.href = 'admin-dashboard.html';
    } else if (this.isWorker()) {
      window.location.href = 'index.html';
    } else {
      window.location.href = 'index.html';
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await window.apiClient.put('/users/profile', profileData);
      this.user = response.user;
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Become a worker
  async becomeWorker() {
    try {
      const response = await window.apiClient.post('/users/become-worker');
      this.user = response.user;
      this.workerProfile = response.workerProfile;
      return response;
    } catch (error) {
      throw error;
    }
  }
}

// Global worker auth guard instance
const workerAuthGuard = new WorkerAuthGuard();

// Make it available globally
window.workerAuthGuard = workerAuthGuard;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  workerAuthGuard.init();
});