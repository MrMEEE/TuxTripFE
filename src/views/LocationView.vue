<template>
  <div class="locations-page">
    <h2>Lokationsoversigt</h2>
    <LocationForm @locationCreated="handleLocationCreated" />
    <LocationList ref="locationListRef" />
  </div>
</template>

<script setup>
import LocationForm from '@/components/LocationForm.vue';
import LocationList from '@/components/LocationList.vue';
import { ref } from 'vue';

const locationListRef = ref(null);

const handleLocationCreated = () => {
  if (locationListRef.value) {
    locationListRef.value.fetchLocations();
  }
};
</script>

<style scoped>
.locations-page {
  padding: 0 20px;
}
h2 {
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
  margin-bottom: 30px;
}
</style>