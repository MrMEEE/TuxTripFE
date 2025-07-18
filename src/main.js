import { createApp, watch } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';

import { useAuthStore } from '@/stores/authStore';

// --- Import English messages ---
import enCommon from './locales/en/common.json';
import enNav from './locales/en/nav.json';
import enLogin from './locales/en/login.json';
import enUserAdmin from './locales/en/userAdmin.json';
import enTrips from './locales/en/trips.json';
import enLocations from './locales/en/locations.json';
import enDashboard from './locales/en/dashboard.json';
import enAbout from './locales/en/about.json';

// --- Import Danish messages ---
import daCommon from './locales/da/common.json';
import daNav from './locales/da/nav.json';
import daLogin from './locales/da/login.json';
import daUserAdmin from './locales/da/userAdmin.json';
import daTrips from './locales/da/trips.json';
import daLocations from './locales/da/locations.json';
import daDashboard from './locales/da/dashboard.json';
import daAbout from './locales/da/about.json';


// --- Vue-i18n Configuration ---
const messages = {
  en: {
    common: enCommon,
    nav: enNav,
    login: enLogin,
    userAdmin: enUserAdmin,
    trips: enTrips,
    locations: enLocations,
    dashboard: enDashboard,
    about: enAbout
  },
  da: {
    common: daCommon,
    nav: daNav,
    login: daLogin,
    userAdmin: daUserAdmin,
    trips: daTrips,
    locations: daLocations,
    dashboard: daDashboard,
    about: daAbout
  }
};

const i18n = createI18n({
  locale: localStorage.getItem('locale') || 'da', // Set initial locale from localStorage or default to 'da'
  fallbackLocale: 'en', // Fallback to English if a translation is missing
  messages, // Your combined translation messages
});
// --- End Vue-i18n Configuration ---


const app = createApp(App);
const pinia = createPinia(); // Create a Pinia instance

app.use(pinia); // Use Pinia BEFORE trying to use any stores
app.use(i18n);  // Use Vue-i18n after Pinia

// Initialize authStore after Pinia and i18n are used by the app instance
const authStore = useAuthStore();
authStore.initializeAuth(); // Call the action to rehydrate state

app.use(router); // Use router after Pinia and initial auth setup
app.mount('#app');

// Watch for locale changes and save to localStorage
watch(() => i18n.global.locale, (newLocale) => {
    localStorage.setItem('locale', newLocale);
});