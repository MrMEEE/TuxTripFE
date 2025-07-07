// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore'; // Import auth store

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/LoginView.vue'), // Assuming this is your login component
        meta: { requiresAuth: false, hideSidebar: true } // <--- ADD THIS LINE
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
    const authStore = useAuthStore();
    const isAuthenticated = authStore.isAuthenticated;
    const isAdmin = authStore.isAdmin;

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login');
    } else if (to.meta.requiresAdmin && (!isAuthenticated || !isAdmin)) {
        next('/trips');
    } else if (to.path === '/login' && isAuthenticated) {
        next('/trips');
    } else {
        next();
    }
});

export default router;