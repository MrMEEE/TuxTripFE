<script setup>
import { RouterView, RouterLink, useRouter } from 'vue-router';
import { ref, onMounted, watch } from 'vue';

import { apiService } from '@/services/apiService';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
// const isSidebarToggled = ref(false); // REMOVE THIS - theme will manage

const authStore = useAuthStore();

// REMOVE THIS FUNCTION ENTIRELY - theme will manage sidebar toggle
// const toggleSidebar = () => {
//   isSidebarToggled.value = !isSidebarToggled.value;
//   document.body.classList.toggle('sidebar-toggled');
//   document.getElementById('accordionSidebar').classList.toggle('toggled');
// };

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

  // Handle the initial state of the sidebar based on theme's JS
  // You might need a small delay for SB Admin 2 JS to initialize
  // Or simply rely on the default theme behavior.
  // If you still need a way to programmatically close the sidebar on mobile after navigation
  // without fighting the theme, it might be more complex.
});

// Remove this router.afterEach if its purpose was purely to manage isSidebarToggled state,
// as the theme's JS will handle the actual toggling.
// If you need it for other reasons, keep it but remove DOM manipulation.
router.afterEach(() => {
    // If the SB Admin 2 theme handles toggling, you might not need this here.
    // Or you'd trigger a theme-specific close function if one exists.
    // For now, let's remove the direct DOM manipulation.
    // if (window.innerWidth < 768) {
    //     // Potentially trigger the theme's sidebar close if needed.
    // }
});

const showSidebarAndTopbar = ref(true);
watch(router.currentRoute, (newRoute) => {
  showSidebarAndTopbar.value = !newRoute.meta.hideSidebar;
}, { immediate: true });
</script>

<template>
    <div id="wrapper"> <ul class="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar" v-if="authStore.isAuthenticated && showSidebarAndTopbar">

            <RouterLink class="sidebar-brand d-flex align-items-center justify-content-center" to="/">
                <div class="sidebar-brand-icon rotate-n-15">
                    <i class="fas fa-laugh-wink"></i>
                </div>
                <div class="sidebar-brand-icon-text mx-3">Kørebog<sup>PWA</sup></div>
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
                        <span>Copyright &copy; Din Digitale Kørebog 2024</span>
                    </div>
                </div>
            </footer>
        </div>
    </div>
    <a class="scroll-to-top rounded" href="#page-top" v-if="authStore.isAuthenticated && showSidebarAndTopbar">
        <i class="fas fa-angle-up"></i>
    </a>

    <div class="text-center d-none d-md-inline sidebar-toggle-button-fix">
      <button class="rounded-circle border-0" id="sidebarToggle"></button>
    </div>
</template>

<style scoped>
/* Add this to give the #sidebarToggle button a place if it's not managed by Vue's v-if */
.sidebar-toggle-button-fix {
    position: absolute; /* Or adjust positioning as needed for layout */
    bottom: 1rem;
    right: 1rem; /* Adjust based on your desired layout */
    z-index: 99; /* Ensure it's above other elements if positioned absolutely */
}
body {
    margin: 0;
    padding: 0;
}
#app {
    display: contents;
}
.sidebar .nav-item .nav-link {
    display: flex;
    align-items: center;
    gap: 10px;
}
</style>