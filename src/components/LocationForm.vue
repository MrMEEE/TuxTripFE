<script setup>
import { ref, watch } from 'vue';
import { apiService } from '@/services/apiService';

const props = defineProps({
    editingLocation: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['locationCreated', 'locationUpdated']);

const name = ref('');
const address = ref('');
const latitude = ref('');
const longitude = ref('');
const description = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const showSuccess = ref(false);

// Autocomplete specific refs
const suggestions = ref([]);
const showSuggestions = ref(false);
let debounceTimeout = null;

const resetForm = () => {
    name.value = '';
    address.value = '';
    latitude.value = '';
    longitude.value = '';
    description.value = '';
    suggestions.value = [];
    showSuggestions.value = false;
};

// Watch for changes in editingLocation prop to populate form for editing
watch(() => props.editingLocation, (newVal) => {
    if (newVal) {
        name.value = newVal.name || '';
        address.value = newVal.address || '';
        latitude.value = newVal.latitude || '';
        longitude.value = newVal.longitude || '';
        description.value = newVal.description || '';
    } else {
        resetForm();
    }
}, { immediate: true });


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
    console.log("Selected suggestion:", suggestion); // Keep for debugging if needed
    address.value = suggestion.display_name;
    latitude.value = suggestion.latitude;   // <--- CHANGE THIS LINE
    longitude.value = suggestion.longitude; // <--- CHANGE THIS LINE
    console.log("Assigned latitude:", latitude.value); // Keep for debugging
    console.log("Assigned longitude:", longitude.value); // Keep for debugging
    suggestions.value = [];
    showSuggestions.value = false;
};

const handleSubmit = async () => {
    errorMessage.value = '';
    successMessage.value = '';
    showSuccess.value = false;

    if (!name.value || !address.value || latitude.value === '' || longitude.value === '') {
        errorMessage.value = "Navn, adresse, breddegrad og længdegrad er påkrævet.";
        return;
    }

    const latNum = parseFloat(latitude.value);
    const lonNum = parseFloat(longitude.value);

    if (isNaN(latNum) || isNaN(lonNum)) {
        errorMessage.value = "Breddegrad og længdegrad skal være gyldige tal.";
        return;
    }

    try {
        const locationData = {
            name: name.value,
            address: address.value,
            latitude: latNum,
            longitude: lonNum,
            description: description.value
        };

        let response;
        if (props.editingLocation) {
            response = await apiService.updateLocation(props.editingLocation.id, locationData);
            successMessage.value = response.message || 'Lokation opdateret succesfuldt!';
            emit('locationUpdated');
        } else {
            response = await apiService.createLocation(locationData);
            successMessage.value = response.message || 'Lokation oprettet succesfuldt!';
            emit('locationCreated');
        }

        showSuccess.value = true;
        resetForm();

        setTimeout(() => {
            showSuccess.value = false;
            successMessage.value = '';
        }, 5000);
    } catch (error) {
        errorMessage.value = error.message || 'Fejl ved oprettelse/opdatering af lokation.';
        console.error('Fejl ved oprettelse/opdatering af lokation:', error);
    }
};

// Expose resetForm for parent to call
defineExpose({
    resetForm
});
</script>

<template>
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">{{ editingLocation ? 'Rediger Lokation' : 'Opret Ny Lokation' }}</h6>
        </div>
        <div class="card-body">
            <form @submit.prevent="handleSubmit">
                <div class="mb-3">
                    <label for="name" class="form-label">Navn</label>
                    <input type="text" class="form-control" id="name" v-model="name" required>
                </div>
                <div class="mb-3">
                    <label for="address" class="form-label">Adresse</label>
                    <input
                        type="text"
                        class="form-control"
                        id="address"
                        v-model="address"
                        @input="lookupAddress"
                        autocomplete="off"
                        required
                    >
                    <ul v-if="showSuggestions && suggestions.length" class="list-group position-absolute w-100 z-1000" style="z-index: 100;">
                        <li v-for="suggestion in suggestions" :key="suggestion.place_id" @click="selectSuggestion(suggestion)" class="list-group-item list-group-item-action cursor-pointer">
                            {{ suggestion.display_name }}
                        </li>
                    </ul>
                </div>
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label for="latitude" class="form-label">Breddegrad</label>
                        <input type="number" step="any" class="form-control" id="latitude" v-model="latitude" required>
                    </div>
                    <div class="col-md-6">
                        <label for="longitude" class="form-label">Længdegrad</label>
                        <input type="number" step="any" class="form-control" id="longitude" v-model="longitude" required>
                    </div>
                </div>
                <div class="mb-3">
                    <label for="description" class="form-label">Beskrivelse (valgfri)</label>
                    <textarea class="form-control" id="description" rows="3" v-model="description"></textarea>
                </div>

                <div v-if="errorMessage" class="alert alert-danger mt-3" role="alert">
                    {{ errorMessage }}
                </div>
                <div v-if="showSuccess" class="alert alert-success mt-3" role="alert">
                    {{ successMessage }}
                </div>

                <button type="submit" class="btn btn-primary">
                    {{ editingLocation ? 'Opdater Lokation' : 'Opret Lokation' }}
                </button>
                <button type="button" class="btn btn-secondary ms-2" @click="resetForm" v-if="editingLocation">
                    Annuller Redigering
                </button>
            </form>
        </div>
    </div>
</template>

<style scoped>
/* Add any specific styles for LocationsForm here */
.list-group {
    max-height: 200px; /* Limit height of suggestion list */
    overflow-y: auto; /* Enable scrolling for suggestions */
}
.list-group-item {
    cursor: pointer;
}
</style>