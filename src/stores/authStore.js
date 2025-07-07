// src/stores/authStore.js
import { defineStore } from 'pinia';
// Removed direct import of apiService here to break circular dependency
// import { apiService } from '@/services/apiService'; // DO NOT IMPORT API SERVICE HERE

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('jwt_token') || null,
        username: localStorage.getItem('username') || null,
        isAdmin: localStorage.getItem('is_admin') === 'true' || false, // Ensure boolean conversion
        isAuthenticated: !!localStorage.getItem('jwt_token'),
        authError: null,
    }),
    actions: {
        async login(username, password) {
            this.authError = null; // Clear previous errors
            try {
                // We will call the API service from the LoginView directly,
                // and then commit to the store
                // For a more structured approach, you'd pass apiService as a param or use a global.
                // For now, let's assume LoginView handles the direct apiService call.

                // This part needs to be called from the component itself (LoginView)
                // that imports apiService directly.
                // The store handles state management *after* API calls.
                // The `apiService.login` now just returns data, doesn't set local storage.
                // This store sets local storage.
                const response = await this.performLoginApiCall(username, password); // This will be mocked or passed

                this.token = response.access_token;
                this.username = response.username;
                this.isAdmin = response.is_admin;
                this.isAuthenticated = true;

                localStorage.setItem('jwt_token', this.token);
                localStorage.setItem('username', this.username);
                localStorage.setItem('is_admin', this.isAdmin.toString()); // Store as string

                return true; // Login successful
            } catch (error) {
                // FIX: Typo from this.authStore to this.authError
                this.authError = error.message || 'Login fejlede. Tjek dine legitimationsoplysninger.';
                this.clearAuth(); // Use a dedicated clear function
                throw error; // Re-throw to propagate error for UI handling
            }
        },
        // Dedicated action to clear auth state (for logout or error)
        clearAuth() {
            this.token = null;
            this.username = null;
            this.isAdmin = false;
            this.isAuthenticated = false;
            this.authError = null;

            localStorage.removeItem('jwt_token');
            localStorage.removeItem('username');
            localStorage.removeItem('is_admin');
        },
        // This action can be called on app startup to rehydrate state from localStorage
        initializeAuth() {
            this.token = localStorage.getItem('jwt_token');
            this.username = localStorage.getItem('username');
            // localStorage stores boolean as string, so convert back
            this.isAdmin = localStorage.getItem('is_admin') === 'true';
            this.isAuthenticated = !!this.token; // Check if token exists
        },
        // This is a placeholder for the API call logic. It will be provided by LoginView.
        // It's better to inject apiService or have LoginView handle the apiService call.
        setPerformLoginApiCall(callback) {
            this.performLoginApiCall = callback;
        }
    }
});

// Listener for custom event dispatched by apiService interceptor
window.addEventListener('unauthorized-access', () => {
    const authStore = useAuthStore();
    authStore.clearAuth();
    // Use router to redirect, but avoid direct import here if possible to prevent circular deps
    // You might need to re-think this if direct redirect is desired here.
    // For now, let the router's beforeEach handle the redirect if isAuthenticated is false
    console.warn("Unauthorized access detected. User state cleared.");
    // Force a page reload or router push if necessary to ensure logout.
    // window.location.href = '/login'; // Or use router.push('/login') if available globally
});