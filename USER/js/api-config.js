// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API Endpoints
const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    GOOGLE: '/auth/google'
  },

  // Users
  USERS: {
    PROFILE: '/users/profile',
    BECOME_WORKER: '/users/become-worker'
  },

  // Workers
  WORKERS: {
    PROFILE: '/workers/profile',
    AVAILABILITY: '/workers/availability',
    ISSUES: '/workers/issues',
    MY_ISSUES: '/workers/my-issues',
    STATS: '/workers/stats'
  },

  // Issues
  ISSUES: {
    BASE: '/issues',
    BID: (id) => `/issues/${id}/bid`,
    ACCEPT_BID: (id) => `/issues/${id}/accept-bid`,
    RATE: (id) => `/issues/${id}/rate`
  },

  // Chat
  CHAT: {
    MESSAGES: (issueId) => `/chat/messages/${issueId}`
  },

  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    WORKERS: '/admin/workers',
    ISSUES: '/admin/issues',
    ANALYTICS: '/admin/analytics',
    CATEGORIES: '/admin/categories',
    TUTORIALS: '/admin/tutorials'
  }
};

// API Helper Functions
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        // Token expired or invalid
        this.setToken(null);
        window.location.href = 'login.html';
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // HTTP Methods
  async get(endpoint) {
    return this.request(endpoint);
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  // Auth methods
  async login(credentials) {
    const response = await this.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async register(userData) {
    const response = await this.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async logout() {
    await this.post(API_ENDPOINTS.AUTH.LOGOUT);
    this.setToken(null);
  }

  async getCurrentUser() {
    return this.get(API_ENDPOINTS.AUTH.ME);
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Get user role from token (basic implementation)
  getUserRole() {
    if (!this.token) return null;

    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return payload.role || null;
    } catch (error) {
      return null;
    }
  }
}

// Global API client instance
const apiClient = new ApiClient();

// Make it available globally
window.apiClient = apiClient;