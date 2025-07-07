import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LocationView from '../views/LocationView.vue'
import TripView from '../views/TripView.vue'
import LoginForm from '@/components/LoginForm.vue'
import AdminUserView from '@/views/AdminUserView.vue' // New admin view
import { apiService } from '@/services/apiService'; // Import apiService

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: LoginForm,
      meta: { requiresAuth: false, hideSidebar: true } // Hide sidebar on login page
    },
    // Removed /register route as public registration is no longer allowed
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/locations',
      name: 'locations',
      component: LocationView,
      meta: { requiresAuth: true }
    },
    {
      path: '/trips',
      name: 'trips',
      component: TripView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: AdminUserView,
      meta: { requiresAuth: true, requiresAdmin: true } // Requires both auth AND admin
    }
  ]
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = apiService.getAuthStatus();
  const isAdmin = apiService.getIsAdmin(); // Get admin status

  if (to.meta.requiresAuth && !isAuthenticated) {
    // If route requires auth and user is not authenticated, redirect to login page
    next('/login');
  } else if (to.meta.requiresAdmin && !isAdmin) {
    // If route requires admin and user is not admin, redirect to home or show error
    alert("Du har ikke administratorrettigheder til at tilgå denne side.");
    next('/'); // Redirect to home
  } else if (to.name === 'Login' && isAuthenticated) {
    // If user is authenticated and tries to go to login, redirect to home
    next('/');
  } else {
    // Otherwise, allow navigation
    next();
  }
});

export default router