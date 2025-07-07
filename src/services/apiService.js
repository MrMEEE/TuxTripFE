import axios from 'axios';
// DO NOT import authStore here to prevent circular dependency
// import { useAuthStore } from '@/stores/authStore';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt_token'); // Get token directly from localStorage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle token expiration/invalidation
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Dispatch a custom event instead of directly calling authStore.logout()
            // This decouples apiService from authStore.
            window.dispatchEvent(new CustomEvent('unauthorized-access'));
            console.error("Authentication failed or token expired. Please log in again.");
        }
        return Promise.reject(error);
    }
);

export const apiService = {
    // Auth - this now only performs the API call and returns the data
    login: async (username, password) => {
        const response = await api.post('/login', { username, password });
        return response.data; // authStore will handle storing token/user info
    },
    // The apiService doesn't manage localStorage for logout directly now
    // It's handled by authStore's clearAuth triggered by the custom event.
    // This logout function is effectively empty and might be removed if not used elsewhere.
    logout: () => {
        // No direct action here, it's triggered by the `unauthorized-access` event
        // or by the `authStore.logout` which calls `clearAuth`.
    },

    // User Management (Admin)
    getUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },
    createUser: async (userData) => {
        const response = await api.post('/admin/users', userData);
        return response.data;
    },
    updateUser: async (userId, userData) => {
        const response = await api.put(`/admin/users/${userId}`, userData);
        return response.data;
    },
    deleteUser: async (userId) => {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data;
    },

    // Location Management
    lookupAddress: async (address) => {
        const response = await api.get(`/lookup-address?address=${encodeURIComponent(address)}`);
        return response.data;
    },
    createLocation: async (locationData) => {
        const response = await api.post('/locations', locationData);
        return response.data;
    },
    getLocations: async () => {
        const response = await api.get('/locations');
        return response.data;
    },
    updateLocation: async (locationId, locationData) => {
        const response = await api.put(`/locations/${locationId}`, locationData);
        return response.data;
    },
    deleteLocation: async (locationId) => {
        const response = await api.delete(`/locations/${locationId}`);
        return response.data;
    },

    // Trip Management
    createTrip: async (tripData) => {
        const response = await api.post('/trips', tripData);
        return response.data;
    },
    getTrips: async () => {
        const response = await api.get('/trips');
        return response.data;
    }
};