<script setup>
import { RouterView, RouterLink, useRouter } from 'vue-router';
import { ref, onMounted, watch } from 'vue';

import { apiService } from '@/services/apiService';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();

const authStore = useAuthStore();

const handleLogout = () => {
  authStore.clearAuth();
  router.push('/login');
};

onMounted(() => {
  if (!authStore.isAuthenticated && router.currentRoute.value.name !== 'Login') {
    router.push('/login');
  }

  authStore.$subscribe((mutation, state) => {
    if (!state.isAuthenticated && router.currentRoute.value.path !== '/login') {
      router.push('/login');
    }
  });

  // No manual sidebar toggling or class manipulation here.
  // Rely on sb-admin-2.min.js for sidebar behavior.
});

// Remove this router.afterEach if its purpose was purely to manage isSidebarToggled state,
// as the theme's JS will handle the actual toggling.
router.afterEach(() => {
    // If you need any specific actions after route change that the theme doesn't handle,
    // you can add them here, but avoid direct DOM manipulation of sidebar classes.
});

const showSidebarAndTopbar = ref(true);
watch(router.currentRoute, (newRoute) => {
  showSidebarAndTopbar.value = !newRoute.meta.hideSidebar;
}, { immediate: true });
</script>

<template>
    <div id="wrapper">
        <ul class="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar" v-if="authStore.isAuthenticated && showSidebarAndTopbar">

            <RouterLink class="sidebar-brand d-flex align-items-center justify-content-center" to="/">
                <div class="sidebar-brand-icon rotate-n-15">
                    <i class="fas fa-car"></i>
                </div>
                <div class="sidebar-brand-icon-text mx-3">TuxTrip</div>
            </RouterLink>

            <hr class="sidebar-divider my-0">

            <li class="nav-item">
                <RouterLink class="nav-link" to="/">
                    <i class="fas fa-fw fa-tachometer-alt"></i>
                    <span>Dashboard</span>
                </RouterLink>
            </li>

            <hr class="sidebar-divider">

            <div class="sidebar-heading">
                Funktioner
            </div>

            <li class="nav-item">
                <RouterLink class="nav-link" to="/locations">
                    <i class="fas fa-fw fa-map-marker-alt"></i>
                    <span>Lokationer</span>
                </RouterLink>
            </li>

            <li class="nav-item">
                <RouterLink class="nav-link" to="/trips">
                    <i class="fas fa-fw fa-road"></i>
                    <span>Ture</span>
                </RouterLink>
            </li>

            <template v-if="authStore.isAdmin">
                <hr class="sidebar-divider">
                <div class="sidebar-heading">
                    Administration
                </div>
                <li class="nav-item">
                    <RouterLink class="nav-link" to="/admin/users">
                        <i class="fas fa-fw fa-users-cog"></i>
                        <span>Brugerstyring</span>
                    </RouterLink>
                </li>
            </template>

            <hr class="sidebar-divider d-none d-md-block">

            <div class="text-center d-none d-md-inline">
                <button class="rounded-circle border-0" id="sidebarToggle"></button>
            </div>

        </ul>
        <div id="content-wrapper" class="d-flex flex-column">

            <div id="content">

                <nav class="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow" v-if="authStore.isAuthenticated && showSidebarAndTopbar">

                    <button id="sidebarToggleTop" class="btn btn-link d-md-none rounded-circle mr-3">
                        <i class="fa fa-bars"></i>
                    </button>

                    <ul class="navbar-nav ml-auto">
                        <li class="nav-item dropdown no-arrow">
                            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <span class="mr-2 d-none d-lg-inline text-gray-600 small">{{ authStore.username || 'Bruger' }}</span>
                                <img class="img-profile rounded-circle" src="/sb-admin-2-theme/img/undraw_profile.svg" alt="Profile">
                            </a>
                            <div class="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">
                                <a class="dropdown-item" href="#">
                                    <i class="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>
                                    Profil
                                </a>
                                <div class="dropdown-divider"></div>
                                <a class="dropdown-item" href="#" @click.prevent="handleLogout">
                                    <i class="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                                    Logud
                                </a>
                            </div>
                        </li>
                    </ul>
                </nav>
                <div class="container-fluid">
                    <RouterView />
                </div>
                </div>
            <footer class="sticky-footer bg-white" v-if="authStore.isAuthenticated && showSidebarAndTopbar">
                <div class="container my-auto">
                    <div class="copyright text-center my-auto">
                        <span>Copyright &copy; TuxTrip {{ new Date().getFullYear() }}</span>
                    </div>
                </div>
            </footer>
            </div>
        </div>
    <a class="scroll-to-top rounded" href="#page-top" v-if="authStore.isAuthenticated && showSidebarAndTopbar">
        <i class="fas fa-angle-up"></i>
    </a>
</template>

<style scoped>
body {
    margin: 0;
    padding: 0;
}
#app {
    display: contents; /* Ensures Vue app doesn't break body/html layout */
}
.sidebar .nav-item .nav-link {
    display: flex;
    align-items: center;
    gap: 10px;
}
/* Removed .sidebar-toggle-button-fix as the #sidebarToggle button is now correctly inside the sidebar UL */
</style>