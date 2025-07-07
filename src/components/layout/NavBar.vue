<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
    authStore.clearAuth(); // Use the clearAuth action
    router.push('/login');
};
</script>

<template>
    <nav class="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
        <ul class="navbar-nav ml-auto">
            <li class="nav-item dropdown no-arrow">
                <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button"
                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="mr-2 d-none d-lg-inline text-gray-600 small">
                        {{ authStore.username || 'Gæst' }}
                        <span v-if="authStore.isAdmin" class="badge bg-primary ms-1">Admin</span>
                    </span>
                    <img class="img-profile rounded-circle" src="@/assets/img/undraw_profile.svg" alt="Profile Image">
                </a>
                <div class="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">
                    <router-link v-if="authStore.isAdmin" class="dropdown-item" :to="{ name: 'AdminUsers' }">
                        <i class="fas fa-users fa-sm fa-fw mr-2 text-gray-400"></i>
                        Brugeradministration
                    </router-link>
                    <div class="dropdown-divider" v-if="authStore.isAdmin"></div>
                    <a class="dropdown-item" href="#" @click.prevent="handleLogout">
                        <i class="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                        Log ud
                    </a>
                </div>
            </li>
        </ul>
    </nav>
</template>

<style scoped>
/* Add specific styles here if needed */
</style>