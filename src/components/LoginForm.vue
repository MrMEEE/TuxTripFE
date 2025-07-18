<template>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-xl-10 col-lg-12 col-md-9">
                <div class="card o-hidden border-0 shadow-lg my-5">
                    <div class="card-body p-0">
                        <div class="row">
                            <div class="col-lg-6 d-none d-lg-block bg-login-image"></div>
                            <div class="col-lg-6">
                                <div class="p-5">
                                    <div class="text-center">
                                        <h1 class="h4 text-gray-900 mb-4">{{ $t('login.title') }}</h1>
                                    </div>
                                    <form class="user" @submit.prevent="handleLogin">
                                        <div class="form-group">
                                            <input
                                                type="text"
                                                class="form-control form-control-user"
                                                id="exampleInputUsername"
                                                :placeholder="$t('login.username')"
                                                v-model="username"
                                                required
                                            />
                                        </div>
                                        <div class="form-group">
                                            <input
                                                type="password"
                                                class="form-control form-control-user"
                                                id="exampleInputPassword"
                                                :placeholder="$t('login.password')"
                                                v-model="password"
                                                required
                                            />
                                        </div>
                                        <button type="submit" class="btn btn-primary btn-user btn-block" :disabled="authStore.loading">
                                            <span v-if="authStore.loading">{{ $t('common.loading') }}</span>
                                            <span v-else>{{ $t('login.loginButton') }}</span>
                                        </button>
                                    </form>
                                    <hr />
                                    <div v-if="authStore.authError" class="alert alert-danger">
                                        {{ authStore.authError }}
                                    </div>
                                    <div v-if="successMessage" class="alert alert-success">
                                        {{ successMessage }}
                                    </div>
                                    <div class="text-center">
                                        <a class="small" href="#" @click.prevent="goToRegister">Opret konto!</a> <!-- Consider adding a translation key for 'Opret konto!' e.g., login.createAccount -->
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

<script setup>
import { ref } from 'vue';
import { apiService } from '@/services/apiService';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore'; // Import your auth store
import { useI18n } from 'vue-i18n'; // Import useI18n

const username = ref('');
const password = ref('');
const successMessage = ref('');
const router = useRouter();
const authStore = useAuthStore(); // Get an instance of the store
const i18n = useI18n(); // Initialize useI18n

const handleLogin = async () => {
    // Clear any previous success messages
    successMessage.value = '';
    // Clear any previous errors from the store
    authStore.authError = null;

    try {
        // 1. Call the API service directly from the component
        const responseData = await apiService.login(username.value, password.value);
        
        // 2. Pass the successful response data to the store's login action
        await authStore.login(responseData);
        
        // 3. Set a temporary success message
        successMessage.value = 'Login succesfuld!'; // Consider adding a translation key for 'Login succesfuld!' e.g., login.loginSuccessful
        
        // 4. Redirect after a small delay to let the user see the success message
        setTimeout(() => {
            router.push('/');
        }, 1000);

    } catch (error) {
        // The error message is now handled directly by the store
        // The store's login action will catch the error and set authStore.authError
        // The `v-if` condition in the template will display it.
        console.error('Login error:', error); // Consider translating this log message too
    }
};

const goToRegister = () => {
    // This is good, no changes needed here.
    router.push('/register');
};
</script>

<style scoped>
/* Specific styling for the login background image */
.bg-login-image {
    background: url('/sb-admin-2-theme/img/undraw_posting_photo.svg'); /* Example image, change as needed */
    background-position: center;
    background-size: cover;
}
</style>
