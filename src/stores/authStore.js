// src/stores/authStore.js
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('jwt_token') || null,
        // The user object stores all user-related data, including is_admin
        user: JSON.parse(localStorage.getItem('user')) || null,
        isAuthenticated: !!localStorage.getItem('jwt_token'),
        authError: null,
        loading: false, // Add a loading state for UI feedback
    }),
    getters: {
        // This is a getter (a computed property), it reads from the user object
        isAdmin: (state) => state.user?.is_admin || false,
    },
    actions: {
        // This action receives the full response data from the API call
        async login(loginResponseData) {
            this.loading = true;
            this.authError = null; // Clear previous errors
            try {
                // Destructure the response data from your Flask backend
                const { access_token, username, is_admin } = loginResponseData;

                this.token = access_token;
                // We update the entire user object in a single reactive step
                const userObject = { username, is_admin };
                this.user = userObject; 
                this.isAuthenticated = true;

                // Store all the info in localStorage
                localStorage.setItem('jwt_token', this.token);
                localStorage.setItem('user', JSON.stringify(userObject));

                return true; // Login successful
            } catch (error) {
                this.authError = 'Login fejlede. Prøv igen.';
                this.clearAuth();
                throw error; // Re-throw to propagate error to the component
            } finally {
                this.loading = false;
            }
        },

        clearAuth() {
            this.token = null;
            this.user = null;
            this.isAuthenticated = false;
            this.authError = null;
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user');
        },
        
        initializeAuth() {
            const token = localStorage.getItem('jwt_token');
            const user = localStorage.getItem('user');

            if (token && user) {
                try {
                    this.token = token;
                    this.user = JSON.parse(user);
                    this.isAuthenticated = true;
                } catch (e) {
                    this.clearAuth();
                }
            }
        },
    },
});

window.addEventListener('unauthorized-access', () => {
    const authStore = useAuthStore();
    authStore.clearAuth();
    console.warn("Unauthorized access detected. User state cleared.");
});