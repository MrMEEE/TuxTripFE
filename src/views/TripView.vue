<script setup>
import { ref } from 'vue';
import TripList from '@/components/TripList.vue';

// The TripList component now handles all modal logic, so this view becomes a simple wrapper.
</script>

<template>
    <div class="container-fluid">
        <h1 class="h3 mb-2 text-gray-800">Ture Oversigt</h1>
        <p class="mb-4">Her kan du se, oprette, redigere og slette dine ture.</p>

        <TripList />
    </div>
</template>

<style scoped>
/* Scoped styles for TripView if any */
</style>