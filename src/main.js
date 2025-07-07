import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia'; // Import createPinia

// Correct import for the auth store
import { useAuthStore } from '@/stores/authStore';

const app = createApp(App);
const pinia = createPinia(); // Create a Pinia instance

app.use(pinia); // Use Pinia BEFORE trying to use any stores

// Initialize authStore after Pinia is used by the app instance
const authStore = useAuthStore();
authStore.initializeAuth(); // Call the action to rehydrate state

app.use(router); // Use router after Pinia and initial auth setup
app.mount('#app');