<script setup>
import { ref } from 'vue';
import TripList from '@/components/TripList.vue';
// No need to import useI18n here if only using $t in template
</script>

<template>
    <div class="container-fluid">
        <h1 class="h3 mb-2 text-gray-800">{{ $t('trips.title') }}</h1>
        <p class="mb-4">{{ $t('trips.subtitle') }}</p>

        <TripList />
    </div>
</template>

<style scoped>
/* Scoped styles for TripView if any */
</style>
