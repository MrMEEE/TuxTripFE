<template>
  <div class="card shadow mb-4">
    <div class="card-header py-3">
      <h6 class="m-0 font-weight-bold text-primary">Eksisterende Lokationer</h6>
    </div>
    <div class="card-body">
      <div v-if="message" :class="['alert', messageType === 'success' ? 'alert-success' : (messageType === 'error' ? 'alert-danger' : 'alert-info')]">
        {{ message }}
      </div>
      <ul class="list-group"> <li v-if="locations.length === 0 && !message" class="list-group-item text-center text-muted">Ingen lokationer fundet.</li>
        <li v-for="loc in locations" :key="loc.id" class="list-group-item d-flex flex-column mb-2 shadow-sm rounded">
          <h5 class="mb-1 text-gray-800"><strong>{{ loc.name }}</strong></h5>
          <small class="text-muted">Adresse: {{ loc.address || 'N/A' }}</small>
          <small class="text-muted">Koordinater: {{ loc.latitude.toFixed(6) }}, {{ loc.longitude.toFixed(6) }}</small>
          <small v-if="loc.description" class="text-muted">Beskrivelse: {{ loc.description }}</small>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { apiService } from '@/services/apiService';

const locations = ref([]);
const message = ref('');
const messageType = ref('');

const fetchLocations = async () => {
  message.value = '';
  messageType.value = '';
  try {
    const data = await apiService.getLocations();
    locations.value = data;
    if (locations.value.length === 0) {
      message.value = 'Hentede ingen lokationer fra databasen.';
      messageType.value = 'info';
    } else {
      message.value = `Hentede ${locations.value.length} lokationer.`;
      messageType.value = 'success';
    }
  } catch (error) {
    console.error('Fejl ved hentning af lokationer:', error);
    message.value = `Fejl ved indlæsning af lokationer: ${error.message}`;
    messageType.value = 'error';
  }
};

onMounted(() => {
  fetchLocations();
});

defineExpose({
  fetchLocations
});
</script>
<style scoped>
/* Minimal custom styles if absolutely necessary */
</style>