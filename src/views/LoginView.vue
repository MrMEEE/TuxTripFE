<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { apiService } from '@/services/apiService';

const username = ref('');
const password = ref('');
const errorMessage = ref('');
const router = useRouter();
const authStore = useAuthStore();

const handleLogin = async () => {
    errorMessage.value = '';
    try {
        const responseData = await apiService.login(username.value, password.value);
        authStore.token = responseData.access_token;
        authStore.username = responseData.username;
        authStore.isAdmin = responseData.is_admin;
        authStore.isAuthenticated = true;

        localStorage.setItem('jwt_token', responseData.access_token);
        localStorage.setItem('username', responseData.username);
        localStorage.setItem('is_admin', responseData.is_admin.toString());

        // Redirect based on admin status
        if (authStore.isAdmin) {
            router.push('/'); // <--- CHANGED FROM '/admin/users' TO '/'
        } else {
            router.push('/'); // <--- CHANGED FROM '/trips' TO '/'
        }
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            errorMessage.value = error.response.data.message;
        } else {
            errorMessage.value = 'Login fejlede. Tjek dine legitimationsoplysninger.';
        }
        console.error("Login failed:", error);
    }
};
</script>

<template>
    <div class="container-fluid login-container">
        <div class="row justify-content-center">
            <div class="col-xl-10 col-lg-12 col-md-9">
                <div class="card o-hidden border-0 shadow-lg my-5">
                    <div class="card-body p-0">
                        <div class="row">
                            <div class="col-lg-6 d-none d-lg-block bg-login-image"></div>
                            <div>
                                <div class="p-5">
                                    <div class="text-center">
                                        <h1 class="h4 text-gray-900 mb-4">Velkommen til TuxTrip!</h1>
                                    </div>
                                    <form class="user" @submit.prevent="handleLogin">
                                        <div class="form-group">
                                            <input type="text" class="form-control form-control-user"
                                                id="exampleInputUsername" aria-describedby="usernameHelp"
                                                placeholder="Indtast brugernavn..." v-model="username" required>
                                        </div>
                                        <div class="form-group">
                                            <input type="password" class="form-control form-control-user"
                                                id="exampleInputPassword" placeholder="Password" v-model="password" required>
                                        </div>
                                        <button type="submit" class="btn btn-primary btn-user btn-block">
                                            Login
                                        </button>
                                    </form>
                                    <hr>
                                    <div v-if="errorMessage" class="alert alert-danger" role="alert">
                                        {{ errorMessage }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Scoped styles specific to LoginView */
.login-container {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fc; /* Light background for the whole page */
}

.bg-login-image {
    background: url('https://source.unsplash.com/K4-jKkQzD04/600x800') center center; /* Replace with your image if preferred */
    background-size: cover;
}
</style>