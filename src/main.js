import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia'; // Import createPinia

const app = createApp(App);
const pinia = createPinia(); // Create a Pinia instance

app.use(pinia); // Use Pinia
app.use(router);
app.mount('#app');

// Optional: Initialize auth state on app startup
import { useAuthStore } from '@/stores/authStore';
const authStore = useAuthStore();
authStore.initializeAuth();