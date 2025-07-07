<script setup>
import { ref, watch } from 'vue';
import { apiService } from '@/services/apiService';

// defineEmits, defineProps, defineExpose are compiler macros, no need to import them.
// const emit = defineEmits(['locationCreated', 'locationUpdated']); // This line is fine, just the import part changes.

const props = defineProps({
    editingLocation: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['locationCreated', 'locationUpdated']); // Define emit AFTER props

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

// --- MOVE resetForm DEFINITION HERE (before the watch that uses it) ---
const resetForm = () => {
    name.value = '';
    address.value = '';
    latitude.value = '';
    longitude.value = '';
    description.value = '';
    suggestions.value = [];
    showSuggestions.value = false;
};
// --- END MOVE ---


// Watch for changes in editingLocation prop to populate form for editing
watch(() => props.editingLocation, (newVal) => {
    if (newVal) {
        name.value = newVal.name || '';
        address.value = newVal.address || '';
        latitude.value = newVal.latitude || '';
        longitude.value = newVal.longitude || '';
        description.value = newVal.description || '';
    } else {
        // Now resetForm is defined when this watch callback runs immediately
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
    address.value = suggestion.display_name;
    latitude.value = suggestion.lat;
    longitude.value = suggestion.lon;
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
    </template>

<style scoped>
/* ... your existing styles ... */
</style>