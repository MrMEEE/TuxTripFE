<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { apiService } from '@/services/apiService';

const emit = defineEmits(['tripCreated']);

const tripDate = ref('');
const startLocationId = ref('');
const endLocationId = ref('');
const purpose = ref('');
const locations = ref([]);
const errorMessage = ref('');
const successMessage = ref('');
const showSuccess = ref(false);

// Ny reaktiv variabel for returkørsel
const isReturnTrip = ref(false); // <-- TILFØJ DENNE

// Hent lokationer ved komponentindlæsning
onMounted(async () => {
  try {
    locations.value = await apiService.getLocations();
    // Forudvælg den første lokation, hvis der er nogen, for nemheds skyld
    if (locations.value.length > 0) {
      startLocationId.value = locations.value[0].id;
      if (locations.value.length > 1) {
        endLocationId.value = locations.value[1].id;
      } else {
        endLocationId.value = locations.value[0].id; // Hvis kun én, brug den samme
      }
    }
    // Sæt standarddato til i dag
    const today = new Date();
    tripDate.value = today.toISOString().split('T')[0];
  } catch (error) {
    errorMessage.value = 'Kunne ikke hente lokationer: ' + error.message;
    console.error('Fejl ved hentning af lokationer:', error);
  }
});

// Funktion til at oprette tur
const createTrip = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  showSuccess.value = false;

  try {
    const tripData = {
      date: tripDate.value,
      start_location_id: startLocationId.value,
      end_location_id: endLocationId.value,
      purpose: purpose.value,
      is_return_trip: isReturnTrip.value // <-- SEND DENNE NYE VÆRDI
    };

    const response = await apiService.createTrip(tripData);
    successMessage.value = response.message || 'Tur(e) oprettet succesfuldt!';
    showSuccess.value = true;
    emit('tripCreated'); // Informer forælderkomponenten om, at en tur er oprettet

    // Nulstil formularfelter (valgfrit)
    // startLocationId.value = ''; // Behold eventuelt for at nemt tilføje flere ture
    // endLocationId.value = '';
    purpose.value = '';
    isReturnTrip.value = false; // Nulstil checkbox

    // Skjul success-besked efter et par sekunder
    setTimeout(() => {
      showSuccess.value = false;
      successMessage.value = '';
    }, 5000);

  } catch (error) {
    errorMessage.value = error.message || 'Fejl ved oprettelse af tur.';
    console.error('Fejl ved oprettelse af tur:', error);
  }
};
</script>

<template>
  <div class="card shadow mb-4">
    <div class="card-header py-3">
      <h6 class="m-0 font-weight-bold text-primary">Opret ny tur</h6>
    </div>
    <div class="card-body">
      <form @submit.prevent="createTrip">
        <div class="mb-3">
          <label for="tripDate" class="form-label">Dato</label>
          <input type="date" class="form-control" id="tripDate" v-model="tripDate" required>
        </div>
        <div class="mb-3">
          <label for="startLocation" class="form-label">Startlokation</label>
          <select class="form-control" id="startLocation" v-model="startLocationId" required>
            <option v-for="location in locations" :key="location.id" :value="location.id">
              {{ location.name }}
            </option>
          </select>
        </div>
        <div class="mb-3">
          <label for="endLocation" class="form-label">Slutlokation</label>
          <select class="form-control" id="endLocation" v-model="endLocationId" required>
            <option v-for="location in locations" :key="location.id" :value="location.id">
              {{ location.name }}
            </option>
          </select>
        </div>
        <div class="mb-3">
          <label for="purpose" class="form-label">Formål</label>
          <input type="text" class="form-control" id="purpose" v-model="purpose" required>
        </div>

        <div class="form-check mb-3">
          <input type="checkbox" class="form-check-input" id="isReturnTrip" v-model="isReturnTrip">
          <label class="form-check-label" for="isReturnTrip">Opret returkørsel?</label>
        </div>
        <button type="submit" class="btn btn-primary">Opret Tur</button>
      </form>

      <div v-if="errorMessage" class="alert alert-danger mt-3" role="alert">
        {{ errorMessage }}
      </div>
      <div v-if="showSuccess" class="alert alert-success mt-3" role="alert">
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Dine styles */
</style>