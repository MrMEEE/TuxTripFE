<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { apiService } from '@/services/apiService';
import { useI18n } from 'vue-i18n'; // Import useI18n

const username = ref('');
const password = ref('');
const errorMessage = ref('');
const router = useRouter();
const authStore = useAuthStore();
const i18n = useI18n(); // Initialize useI18n

const handleLogin = async () => {
    errorMessage.value = '';
    
    // Set the loading state on the store
    authStore.loading = true;

    try {
        // Step 1: Call the API service to get the response data
        const responseData = await apiService.login(username.value, password.value);

        // Step 2: Pass the response data to the store's login action.
        // This action handles all state mutations safely.
        await authStore.login(responseData);

        // Step 3: Redirect the user after the state is updated
        router.push('/');

    } catch (error) {
        // Handle API errors and set the error message
        if (error.response && error.response.data && error.response.data.message) {
            errorMessage.value = error.response.data.message;
        } else {
            errorMessage.value = i18n.global.t('login.invalidCredentials'); // Translated
        }
        console.error("Login failed:", error); // Consider translating this log message too
    } finally {
        // Reset the loading state
        authStore.loading = false;
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
                                        <h1 class="h4 text-gray-900 mb-4">{{ $t('login.title') }}</h1>
                                    </div>
                                    <form class="user" @submit.prevent="handleLogin">
                                        <div class="form-group">
                                            <input type="text" class="form-control form-control-user"
                                                id="exampleInputUsername" aria-describedby="usernameHelp"
                                                :placeholder="$t('login.username')" v-model="username" required>
                                        </div>
                                        <div class="form-group">
                                            <input type="password" class="form-control form-control-user"
                                                id="exampleInputPassword" :placeholder="$t('login.password')" v-model="password" required>
                                        </div>
                                        <button type="submit" class="btn btn-primary btn-user btn-block" :disabled="authStore.loading">
                                            <span v-if="authStore.loading">{{ $t('common.loading') }}</span>
                                            <span v-else>{{ $t('login.loginButton') }}</span>
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
    background: url('https://source.unsplash.com/K4-jKkQzD04/600x800') center center;
    background-size: cover;
}
</style>
