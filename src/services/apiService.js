// koerebog-frontend/src/services/apiService.js
import { reactive } from 'vue'; // <--- TILFØJ DENNE LINJE
const API_BASE_URL = 'http://localhost:5000/api';

// Simple "store" for authentication token and user info
// GØR authStore til et reaktivt objekt
export const authStore = reactive({ // <--- ÆNDRET: eksporteres direkte og gøres reaktiv
  token: localStorage.getItem('jwt_token') || null,
  username: localStorage.getItem('username') || null,
  isAuthenticated: !!localStorage.getItem('jwt_token'),
  isAdmin: JSON.parse(localStorage.getItem('is_admin')) || false,

  setToken(token, username, isAdmin) {
    this.token = token;
    this.username = username;
    this.isAuthenticated = true;
    this.isAdmin = isAdmin;
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('is_admin', JSON.stringify(isAdmin));

    console.log("authStore.setToken kaldt:"); // Debugging
    console.log("  isAuthenticated:", this.isAuthenticated);
    console.log("  username:", this.username);
    console.log("  isAdmin:", this.isAdmin);
  },

  clearToken() {
    this.token = null;
    this.username = null;
    this.isAuthenticated = false;
    this.isAdmin = false;
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('username');
    localStorage.removeItem('is_admin');
  }
});

async function request(url, method = 'GET', data = null, requiresAuth = true) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth && authStore.token) {
    headers['Authorization'] = `Bearer ${authStore.token}`;
  }

  const config = {
    method,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    const result = await response.json();

    if (!response.ok) {
      if (response.status === 401 && requiresAuth) {
        authStore.clearToken(); // Clear invalid token
        console.error("401 Uautoriseret: Token kan være ugyldigt eller udløbet. Log ind igen.");
      } else if (response.status === 403 && requiresAuth) {
          console.error("403 Forbudt: Du har ikke de nødvendige rettigheder.");
      }
      throw new Error(result.message || `API fejl: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error('Netværks- eller API-fejl:', error);
    throw error;
  }
}

export const apiService = {
  // Authentication
  async login(username, password) {
    const response = await request('/login', 'POST', { username, password }, false);
    console.log("Login API response:", response); // Debugging
    if (response.access_token) {
      authStore.setToken(response.access_token, response.username, response.is_admin);
    }
    return response;
  },

  logout() {
    authStore.clearToken();
  },

  // Disse metoder er nu ikke strengt nødvendige, da authStore er reaktiv
  // men de kan beholdes for konsistens eller hvis du vil have en abstraktion.
  getAuthStatus() {
    return authStore.isAuthenticated;
  },

  getUsername() {
    return authStore.username;
  },

  getIsAdmin() {
    return authStore.isAdmin;
  },

  // Admin User Management
  async adminCreateUser(username, password, isAdmin = false) {
    return request('/admin/users', 'POST', { username, password, is_admin: isAdmin });
  },

  async adminGetUsers() {
    return request('/admin/users', 'GET');
  },

  async adminUpdateUser(userId, data) {
    return request(`/admin/users/${userId}`, 'PUT', data);
  },

  async adminDeleteUser(userId) {
    return request(`/admin/users/${userId}`, 'DELETE');
  },

  // Locations
  async createLocation(locationData) {
    return request('/locations', 'POST', locationData);
  },

  async getLocations() {
    return request('/locations', 'GET');
  },

  async lookupAddress(address) {
    return request(`/lookup-address?address=${encodeURIComponent(address)}`, 'GET', null, false);
  },

  // Trips
  async createTrip(tripData) {
    return request('/trips', 'POST', tripData);
  },

  async getTrips() {
    return request('/trips', 'GET');
  }
};