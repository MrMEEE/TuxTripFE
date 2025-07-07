// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore'; // Import auth store

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/LoginView.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/trips',
        name: 'Trips',
        component: () => import('@/views/TripView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/locations',
        name: 'Locations',
        component: () => import('@/views/LocationView.vue'),
        meta: { requiresAuth: true }
    },
    // Admin routes
    {
        path: '/admin/users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/UserManagementView.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/',
        redirect: '/trips' // Default redirect to trips page
    },
    // Catch all 404
    {
        path: '/:catchAll(.*)',
        name: 'NotFound',
        component: () => import('@/views/NotFound.vue') // You might need to create this
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    // Get store instance inside the guard to ensure Pinia is initialized
    const authStore = useAuthStore();
    const isAuthenticated = authStore.isAuthenticated;
    const isAdmin = authStore.isAdmin;

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login'); // Redirect to login if not authenticated
    } else if (to.meta.requiresAdmin && (!isAuthenticated || !isAdmin)) {
        // If it requires admin, user must be authenticated AND admin
        // Redirect to trips (or home) if not an admin or not authenticated
        next('/trips');
    } else if (to.path === '/login' && isAuthenticated) {
        // If trying to go to login page but already logged in, redirect to trips
        next('/trips');
    } else {
        next(); // Proceed to route
    }
});

export default router;