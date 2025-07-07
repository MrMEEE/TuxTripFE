import axios from 'axios';

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
            // Token expired or invalid, clear token and redirect to login
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('username');
            localStorage.removeItem('is_admin');
            // If you have a router, you might want to redirect:
            // router.push('/login');
            console.error("Authentication failed or token expired. Please log in again.");
        }
        return Promise.reject(error);
    }
);

export const apiService = {
    // Auth
    login: async (username, password) => {
        // This method will now ONLY return the response data.
        // The authStore will handle setting localStorage and its own state.
        const response = await api.post('/login', { username, password });
        return response.data;
    },
    logout: () => {
        // apiService's logout should only clear things directly related to API calls if any.
        // localStorage clear is handled by authStore's logout action.
        // No need to clear local storage here, the authStore will do it.
    },
    // ... (rest of your apiService methods)
    getUsers: async () => { /* ... */ },
    createUser: async (userData) => { /* ... */ },
    updateUser: async (userId, userData) => { /* ... */ },
    deleteUser: async (userId) => { /* ... */ },

    // Location Management
    lookupAddress: async (address) => { /* ... */ },
    createLocation: async (locationData) => { /* ... */ },
    getLocations: async () => { /* ... */ },
    updateLocation: async (locationId, locationData) => { /* ... */ },
    deleteLocation: async (locationId) => { /* ... */ },

    // Trip Management
    createTrip: async (tripData) => { /* ... */ },
    getTrips: async () => { /* ... */ }
};