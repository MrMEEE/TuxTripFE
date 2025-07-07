// src/stores/authStore.js
import { defineStore } from 'pinia';
import { apiService } from '@/services/apiService'; // Import apiService here for login/logout

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('jwt_token') || null,
        username: localStorage.getItem('username') || null,
        isAdmin: localStorage.getItem('is_admin') === 'true' || false,
        isAuthenticated: !!localStorage.getItem('jwt_token'),
        authError: null,
    }),
    actions: {
        async login(username, password) {
            this.authError = null; // Clear previous errors
            try {
                const response = await apiService.login(username, password);
                this.token = response.access_token;
                this.username = response.username;
                this.isAdmin = response.is_admin;
                this.isAuthenticated = true;

                localStorage.setItem('jwt_token', this.token);
                localStorage.setItem('username', this.username);
                localStorage.setItem('is_admin', this.isAdmin); // Store as string 'true' or 'false'

                return true; // Login successful
            } catch (error) {
                this.authError = error.message || 'Login fejlede. Tjek dine legitimationsoplysninger.';
                this.logout(); // Ensure state is cleared on failed login
                throw error; // Re-throw to propagate error for UI handling
            }
        },
        logout() {
            this.token = null;
            this.username = null;
            this.isAdmin = false;
            this.isAuthenticated = false;
            this.authError = null;

            localStorage.removeItem('jwt_token');
            localStorage.removeItem('username');
            localStorage.removeItem('is_admin');
            apiService.logout(); // Call apiService's logout to clear axios interceptors if needed
        },
        initializeAuth() {
            // This action can be called on app startup to rehydrate state from localStorage
            this.token = localStorage.getItem('jwt_token');
            this.username = localStorage.getItem('username');
            // localStorage stores boolean as string, so convert back
            this.isAdmin = localStorage.getItem('is_admin') === 'true';
            this.isAuthenticated = !!this.token; // Check if token exists
        }
    }
});