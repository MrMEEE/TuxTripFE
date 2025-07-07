<template>
  <div class="trips-page">
    <h2>Turoversigt</h2>
    <TripForm @tripCreated="handleTripCreated" />
    <TripList ref="tripListRef" />
  </div>
</template>

<script setup>
import TripForm from '@/components/TripForm.vue';
import TripList from '@/components/TripList.vue'; // Importer den nye komponent
import { ref } from 'vue'; // Importer ref til at oprette en template ref

const tripListRef = ref(null); // Opret en ref for at få adgang til TripList komponenten

const handleTripCreated = () => {
  // Kald fetchTrips metoden på TripList komponentinstansen
  if (tripListRef.value) {
    tripListRef.value.fetchTrips();
  }
};
</script>

<style scoped>
.trips-page {
  padding: 0 20px;
}
h2 {
  color: #2c3e50;
  text-align: center;
  margin-top: 20px;
  margin-bottom: 30px;
}
</style>