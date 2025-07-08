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
            
        </div>
        <button class="btn btn-success btn-sm" @click="openCreateLocationModal">
                <i class="fas fa-plus"></i> Opret Ny Lokation
            </button>
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