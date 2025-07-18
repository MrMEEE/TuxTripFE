<template>
    <div class="container-fluid text-center mt-5">
        <div class="error-code mb-3">404</div>
        <div class="error-message mb-4">{{ $t('common.pageNotFound') }}</div>
        <p class="text-gray-500 mb-0">{{ $t('common.errorMatrix') }}</p>
        <router-link :to="{ name: 'Trips' }" class="btn btn-primary mt-3">{{ $t('common.backToHomepage') }}</router-link>
    </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'; // Import useI18n

const i18n = useI18n(); // Initialize useI18n
// No specific logic needed for a simple 404 page
</script>

<style scoped>
.error-code {
    font-size: 10rem;
    font-weight: 900;
    line-height: 1;
    color: #e3e6f0; /* Light gray */
}

.error-message {
    font-size: 1.5rem;
    font-weight: 600;
    color: #5a5c69; /* Darker gray */
}
</style>
