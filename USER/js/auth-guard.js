// Authentication Guard
class AuthGuard {
  constructor() {
    this.user = null;
    this.workerProfile = null;
    this.isInitialized = false;
  }

  // Initialize auth guard
  async init() {
    if (this.isInitialized) return;

    try {
      if (window.apiClient && window.apiClient.isAuthenticated()) {
        const response = await window.apiClient.getCurrentUser();
        this.user = response.user;
        this.workerProfile = response.workerProfile;
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.logout();
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

    // Redirect to login page
    window.location.href = 'login.html';
  }

  // Require authentication for a page
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  // Require worker role
  requireWorker() {
    if (!this.requireAuth()) return false;

    if (!this.isWorker()) {
      alert('This page requires worker access');
      window.location.href = 'index.html';
      return false;
    }
    return true;
  }

  // Require admin role
  requireAdmin() {
    if (!this.requireAuth()) return false;

    if (!this.isAdmin()) {
      alert('This page requires admin access');
      window.location.href = 'index.html';
      return false;
    }
    return true;
  }

  // Redirect based on user role
  redirectBasedOnRole() {
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
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

// Global auth guard instance
const authGuard = new AuthGuard();

// Make it available globally
window.authGuard = authGuard;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  authGuard.init();
});