<script setup>
import { RouterView, RouterLink, useRouter } from 'vue-router';
import { ref, onMounted, watch } from 'vue';
import { apiService, authStore } from '@/services/apiService'; // <--- TILFØJ authStore her

const router = useRouter();
const isSidebarToggled = ref(false);

// Brug nu authStore direkte, da det er reaktivt
// Ingen grund til at pakke dem ind i ref() her, da authStore.isAuthenticated/isAdmin allerede er reaktive.
// Men vi kan gøre det for at bevare konsistens med tidligere kode, hvis det ønskes.
// For at være mest Vue-idiomatisk, kan vi fjerne ref() og blot bruge authStore direkte i template.
// Men for nu, lad os holde det som det er, og blot fjerne watch.
// Eller endnu bedre, fjern ref() og brug authStore direkte.

// Fjern de individuelle ref() for isAuthenticated, username, isAdmin herfra.
// Vi vil bruge authStore.isAuthenticated, authStore.username, authStore.isAdmin direkte i template.

// Fjern hele denne watch-blok, da vi nu bruger authStore direkte i template.
// watch(() => apiService.getAuthStatus(), (newVal) => {
//   isAuthenticated.value = newVal;
//   username.value = apiService.getUsername();
//   isAdmin.value = apiService.getIsAdmin();
//   console.log("App.vue - auth status changed:");
//   console.log("  isAuthenticated.value:", isAuthenticated.value);
//   console.log("  username.value:", username.value);
//   console.log("  isAdmin.value:", isAdmin.value);
// });

const toggleSidebar = () => {
  isSidebarToggled.value = !isSidebarToggled.value;
  document.body.classList.toggle('sidebar-toggled');
  document.getElementById('accordionSidebar').classList.toggle('toggled');
};

const handleLogout = () => {
  apiService.logout();
  router.push('/login'); // Redirect to login page
};

// Initial check on mount
onMounted(() => {
  // Hvis ikke autentificeret og ikke på login-side, omdiriger til login
  if (!authStore.isAuthenticated && router.currentRoute.value.name !== 'Login') { // <--- Brug authStore direkte
    router.push('/login');
  }
});

// Watch current route to ensure sidebar close on mobile when navigating
router.afterEach(() => {
  if (isSidebarToggled.value) { // If sidebar is open
    // Check if current view is mobile (SB Admin 2 uses d-none d-md-inline for toggle)
    if (window.innerWidth < 768) { // Based on SB Admin 2's MD breakpoint
        isSidebarToggled.value = false;
        document.body.classList.remove('sidebar-toggled');
        document.getElementById('accordionSidebar').classList.remove('toggled');
    }
  }
});

// Computed property to determine if sidebar should be visible
const showSidebarAndTopbar = ref(true);
watch(router.currentRoute, (newRoute) => {
  showSidebarAndTopbar.value = !newRoute.meta.hideSidebar;
}, { immediate: true }); // Run immediately on component mount
</script>

<template>
  <div id="wrapper" :class="{ 'sidebar-toggled': isSidebarToggled }">

    <ul class="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar" :class="{ 'toggled': isSidebarToggled }" v-if="showSidebarAndTopbar">

      <RouterLink class="sidebar-brand d-flex align-items-center justify-content-center" to="/">
        <div class="sidebar-brand-icon rotate-n-15">
          <i class="fas fa-laugh-wink"></i>
        </div>
        <div class="sidebar-brand-icon-text mx-3">Kørebog<sup>PWA</sup></div>
      </RouterLink>

      <hr class="sidebar-divider my-0">

      <template v-if="authStore.isAuthenticated"> <li class="nav-item">
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

        <template v-if="authStore.isAdmin"> <hr class="sidebar-divider">
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
      </template>
      <template v-else>
        <li class="nav-item">
          <RouterLink class="nav-link" to="/login">
            <i class="fas fa-fw fa-sign-in-alt"></i>
            <span>Login</span>
          </RouterLink>
        </li>
      </template>

      <hr class="sidebar-divider d-none d-md-block">

      <div class="text-center d-none d-md-inline">
        <button class="rounded-circle border-0" id="sidebarToggle" @click="toggleSidebar"></button>
      </div>

    </ul>
    <div id="content-wrapper" class="d-flex flex-column">

      <div id="content">

        <nav class="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow" v-if="showSidebarAndTopbar">

          <button id="sidebarToggleTop" class="btn btn-link d-md-none rounded-circle mr-3" @click="toggleSidebar">
            <i class="fa fa-bars"></i>
          </button>

          <ul class="navbar-nav ml-auto">
            <template v-if="authStore.isAuthenticated"> <li class="nav-item dropdown no-arrow">
                <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <span class="mr-2 d-none d-lg-inline text-gray-600 small">{{ authStore.username || 'Bruger' }}</span> <img class="img-profile rounded-circle" src="/sb-admin-2-theme/img/undraw_profile.svg" alt="Profile">
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
            </template>
            <template v-else>
              <li class="nav-item">
                <RouterLink class="nav-link" to="/login">
                  <span class="mr-2 d-none d-lg-inline text-gray-600 small">Login</span>
                  <i class="fas fa-sign-in-alt fa-sm fa-fw text-gray-400"></i>
                </RouterLink>
              </li>
            </template>
          </ul>
        </nav>
        <div class="container-fluid">
          <RouterView /> </div>
        </div>
      <footer class="sticky-footer bg-white" v-if="showSidebarAndTopbar">
        <div class="container my-auto">
          <div class="copyright text-center my-auto">
            <span>Copyright &copy; Din Digitale Kørebog 2024</span>
          </div>
        </div>
      </footer>
      </div>
    </div>
  <a class="scroll-to-top rounded" href="#page-top" v-if="showSidebarAndTopbar">
    <i class="fas fa-angle-up"></i>
  </a>

  </template>

<style scoped>
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