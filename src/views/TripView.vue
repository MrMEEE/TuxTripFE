<script setup>
import { ref } from 'vue';
import TripList from '@/components/TripList.vue';

// The TripList component now handles all modal logic, so this view becomes a simple wrapper.
</script>

<template>
    <div class="container-fluid">
        <h1 class="h3 mb-2 text-gray-800">Trip Overview</h1>
        <p class="mb-4">Here you can view, create, edit, and delete your trips.</p>

        <TripList />
    </div>
</template>

<style scoped>
/* Scoped styles for TripView if any */
</style>