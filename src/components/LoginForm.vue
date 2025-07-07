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
                                        <h1 class="h4 text-gray-900 mb-4">Velkommen tilbage!</h1>
                                    </div>
                                    <form class="user" @submit.prevent="handleLogin">
                                        <div class="form-group">
                                            <input
                                                type="text"
                                                class="form-control form-control-user"
                                                id="exampleInputUsername"
                                                placeholder="Brugernavn"
                                                v-model="username"
                                                required
                                            />
                                        </div>
                                        <div class="form-group">
                                            <input
                                                type="password"
                                                class="form-control form-control-user"
                                                id="exampleInputPassword"
                                                placeholder="Password"
                                                v-model="password"
                                                required
                                            />
                                        </div>
                                        <button type="submit" class="btn btn-primary btn-user btn-block">
                                            Login
                                        </button>
                                    </form>
                                    <hr />
                                    <div v-if="message" :class="['alert', messageType === 'success' ? 'alert-success' : 'alert-danger']">
                                        {{ message }}
                                    </div>
                                    <div class="text-center">
                                        <a class="small" href="#" @click.prevent="goToRegister">Opret konto!</a>
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

const username = ref('');
const password = ref('');
const message = ref('');
const messageType = ref('');
const router = useRouter();

const handleLogin = async () => {
    message.value = '';
    messageType.value = '';
    try {
        const response = await apiService.login(username.value, password.value);
        message.value = 'Login succesfuld!';
        messageType.value = 'success';
        // Redirect to home page or dashboard after successful login
        router.push('/');
    } catch (error) {
        message.value = error.message || 'Login fejlede. Prøv igen.';
        messageType.value = 'danger';
        console.error('Login fejl:', error);
    }
};

const goToRegister = () => {
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

/* REMOVED: The body style should not be in a scoped component.
   It should be handled globally by App.vue or your main CSS import. */
/*
body {
    margin: 0;
    padding: 0;
}
*/
</style>