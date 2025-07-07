<script setup>
import { ref, defineEmits, watch } from 'vue'; // Added 'watch'
import { apiService } from '@/services/apiService';

const emit = defineEmits(['locationCreated', 'locationUpdated']); // Added 'locationUpdated'

// Props to receive location data when in edit mode
const props = defineProps({
    editingLocation: {
        type: Object,
        default: null // Will be null for new location, object for editing
    }
});

const name = ref('');
const address = ref('');
const latitude = ref(null);
const longitude = ref(null);
const description = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const showSuccess = ref(false);

// Autocomplete specific refs
const suggestions = ref([]);
const showSuggestions = ref(false);
let debounceTimeout = null; // To prevent excessive API calls

// Watch for changes in editingLocation prop to populate form for editing
watch(() => props.editingLocation, (newVal) => {
    if (newVal) {
        name.value = newVal.name;
        address.value = newVal.address;
        latitude.value = newVal.latitude;
        longitude.value = newVal.longitude;
        description.value = newVal.description;
    } else {
        // Reset form if editingLocation becomes null (e.g., after update)
        resetForm();
    }
}, { immediate: true }); // immediate: true runs the watcher immediately on component mount if prop is already set


// Function to lookup address with Nominatim (now for autocomplete)
const lookupAddress = async () => {
  if (address.value.length < 3) {
    suggestions.value = [];
    showSuggestions.value = false;
    return;
  }

  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }

  debounceTimeout = setTimeout(async () => {
    errorMessage.value = '';
    try {
      const response = await apiService.lookupAddress(address.value);

      if (Array.isArray(response)) {
          suggestions.value = response;
          showSuggestions.value = response.length > 0;
      } else {
          console.warn("Backend did not return an array of suggestions:", response);
          suggestions.value = [];
          showSuggestions.value = false;
      }

    } catch (error) {
      errorMessage.value = error.message || 'Fejl ved adressesøgning.';
      console.error('Fejl ved adressesøgning:', error);
      suggestions.value = [];
      showSuggestions.value = false;
    }
  }, 300);
};

// Function to handle selection of a suggestion
const selectSuggestion = (suggestion) => {
  address.value = suggestion.display_name;
  latitude.value = suggestion.latitude;
  longitude.value = suggestion.longitude;
  suggestions.value = [];
  showSuggestions.value = false;
};

const handleSubmit = async () => {
    errorMessage.value = '';
    successMessage.value = '';
    showSuccess.value = false;

    if (!name.value || !address.value || latitude.value === null || longitude.value === null) {
        errorMessage.value = "Navn, adresse, breddegrad og længdegrad er påkrævet.";
        return;
    }

    try {
        const locationData = {
            name: name.value,
            address: address.value,
            latitude: latitude.value,
            longitude: longitude.value,
            description: description.value
        };

        let response;
        if (props.editingLocation) {
            // Update existing location
            response = await apiService.updateLocation(props.editingLocation.id, locationData);
            successMessage.value = response.message || 'Lokation opdateret succesfuldt!';
            emit('locationUpdated'); // Notify parent of update
        } else {
            // Create new location
            response = await apiService.createLocation(locationData);
            successMessage.value = response.message || 'Lokation oprettet succesfuldt!';
            emit('locationCreated'); // Notify parent of creation
        }

        showSuccess.value = true;
        resetForm(); // Reset form after successful submission

        setTimeout(() => {
            showSuccess.value = false;
            successMessage.value = '';
        }, 5000);
    } catch (error) {
        errorMessage.value = error.message || 'Fejl ved oprettelse/opdatering af lokation.';
        console.error('Fejl ved oprettelse/opdatering af lokation:', error);
    }
};

const resetForm = () => {
    name.value = '';
    address.value = '';
    latitude.value = null;
    longitude.value = null;
    description.value = '';
    suggestions.value = [];
    showSuggestions.value = false;
    // Important: Also reset the editingLocation prop in parent to switch back to create mode
    // This will be handled by the parent component (LocationView.vue)
};

// Expose resetForm for parent to call
defineExpose({
    resetForm
});
</script>

<template>
  <div class="card shadow mb-4">
    <div class="card-header py-3">
      <h6 class="m-0 font-weight-bold text-primary">{{ props.editingLocation ? 'Rediger Lokation' : 'Opret ny lokation' }}</h6>
    </div>
    <div class="card-body">
      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label for="locationName" class="form-label">Navn</label>
          <input type="text" class="form-control" id="locationName" v-model="name" required>
        </div>
        <div class="mb-3">
          <label for="locationAddress" class="form-label">Adresse</label>
          <input
            type="text"
            class="form-control"
            id="locationAddress"
            v-model="address"
            @input="lookupAddress"
            @focus="showSuggestions = suggestions.length > 0"
            @blur="setTimeout(() => showSuggestions = false, 100)"
            required
          >
          <ul v-if="showSuggestions && suggestions.length" class="list-group position-absolute w-100 z-index-1000">
            <li
              v-for="suggestion in suggestions"
              :key="suggestion.place_id"
              class="list-group-item list-group-item-action"
              @mousedown.prevent="selectSuggestion(suggestion)"
            >
              {{ suggestion.display_name }}
            </li>
          </ul>
        </div>
        <div class="mb-3">
          <label for="latitude" class="form-label">Breddegrad</label>
          <input type="number" step="any" class="form-control" id="latitude" v-model="latitude" required>
        </div>
        <div class="mb-3">
          <label for="longitude" class="form-label">Længdegrad</label>
          <input type="number" step="any" class="form-control" id="longitude" v-model="longitude" required>
        </div>
        <div class="mb-3">
          <label for="description" class="form-label">Beskrivelse (valgfrit)</label>
          <textarea class="form-control" id="description" v-model="description"></textarea>
        </div>
        <button type="submit" class="btn btn-primary">{{ props.editingLocation ? 'Opdater Lokation' : 'Opret Lokation' }}</button>
        <button v-if="props.editingLocation" type="button" @click="resetForm" class="btn btn-secondary ms-2">Annuller Redigering</button>
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
.list-group {
  max-height: 200px;
  overflow-y: auto;
  width: 100%;
  background-color: white;
  border: 1px solid #ddd;
  border-top: none;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  z-index: 1000;
}

.list-group-item {
  cursor: pointer;
}
.list-group-item:hover {
  background-color: #f8f9fa;
}
</style>