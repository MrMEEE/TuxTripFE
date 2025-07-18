<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';
import { apiService } from '@/services/apiService';
import { useI18n } from 'vue-i18n'; // Import useI18n

// Define props: show to control visibility, locationData for editing
const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    locationData: { // This prop will hold the location data when editing
        type: Object,
        default: null
    }
});

// Define emits: close to hide modal, locationSaved to notify parent of save
const emits = defineEmits(['close', 'locationSaved']);
const i18n = useI18n(); // Initialize useI18n

// Form state
const locationForm = ref({
    id: null,
    name: '',
    address: '',
    latitude: null,
    longitude: null,
    description: '' // Added description field
});

const formErrors = ref({});
const isSubmitting = ref(false);

// Autocomplete specific refs
const suggestions = ref([]);
const showSuggestions = ref(false);
let debounceTimeout = null; // For debouncing the API call

// Resets the form state
const resetForm = () => {
    locationForm.value = {
        id: null,
        name: '',
        address: '',
        latitude: null,
        longitude: null,
        description: '' // Reset description as well
    };
    formErrors.value = {};
    isSubmitting.value = false;
    suggestions.value = [];       // Clear suggestions
    showSuggestions.value = false; // Hide suggestions
    if (debounceTimeout) {
        clearTimeout(debounceTimeout); // Clear any pending debounce
    }
};

// Watch for changes in the `locationData` prop (used when editing an existing location)
watch(() => props.locationData, (newVal) => {
    if (newVal) {
        // Populate form fields with existing location data
        locationForm.value.id = newVal.id || null;
        locationForm.value.name = newVal.name || '';
        locationForm.value.address = newVal.address || '';
        locationForm.value.latitude = newVal.latitude || null;
        locationForm.value.longitude = newVal.longitude || null;
        locationForm.value.description = newVal.description || ''; // Populate description
    } else {
        resetForm(); // Reset form for new location creation
    }
}, { immediate: true }); // immediate: true ensures it runs on initial mount if data is present

// --- Autocomplete Logic ---
const lookupAddress = async () => {
    if (locationForm.value.address.length < 3) { // Only search if at least 3 characters
        suggestions.value = [];
        showSuggestions.value = false;
        return;
    }

    if (debounceTimeout) {
        clearTimeout(debounceTimeout);
    }

    debounceTimeout = setTimeout(async () => {
        formErrors.value.addressLookup = ''; // Clear previous lookup errors
        try {
            // Note: apiService.lookupAddress expects a query string.
            // Ensure your apiService method correctly formats this for Nominatim.
            const response = await apiService.lookupAddress(locationForm.value.address);

            if (Array.isArray(response)) {
                suggestions.value = response;
                showSuggestions.value = response.length > 0;
            } else {
                console.warn("Backend did not return an array of suggestions:", response);
                suggestions.value = [];
                showSuggestions.value = false;
            }
        } catch (error) {
            formErrors.value.addressLookup = error.message || i18n.global.t('locations.errorAddressLookup');
            console.error(i18n.global.t('locations.errorAddressLookup'), error);
            suggestions.value = [];
            showSuggestions.value = false;
        }
    }, 300); // Debounce for 300ms
};

const selectSuggestion = (suggestion) => {
    console.log("Selected suggestion object:", suggestion); // Keep for initial debugging
    console.log("suggestion.lat:", suggestion.lat, "typeof:", typeof suggestion.lat);
    console.log("suggestion.lon:", suggestion.lon, "typeof:", typeof suggestion.lon);

    locationForm.value.address = suggestion.display_name;

    const parsedLat = parseFloat(suggestion?.latitude);
    locationForm.value.latitude = isNaN(parsedLat) ? null : parsedLat;

    const parsedLon = parseFloat(suggestion?.longitude);
    locationForm.value.longitude = isNaN(parsedLon) ? null : parsedLon;
    // --- END CHANGES ---

    // console.log("Assigned latitude:", locationForm.value.latitude);
    // console.log("Assigned longitude:", locationForm.value.longitude);

    suggestions.value = [];
    showSuggestions.value = false;
};

// --- Form Submission & Validation Logic ---
const validateForm = () => {
    formErrors.value = {}; // Reset errors
    let isValid = true;

    if (!locationForm.value.name) {
        formErrors.value.name = i18n.global.t('locations.nameRequired');
        isValid = false;
    }
    if (!locationForm.value.address) {
        formErrors.value.address = i18n.global.t('locations.addressRequired');
        isValid = false;
    }

    const latNum = parseFloat(locationForm.value.latitude);
    const lonNum = parseFloat(locationForm.value.longitude);

    if (locationForm.value.latitude === null || isNaN(latNum)) {
        formErrors.value.latitude = i18n.global.t('locations.latitudeRequired');
        isValid = false;
    }
    if (locationForm.value.longitude === null || isNaN(lonNum)) {
        formErrors.value.longitude = i18n.global.t('locations.longitudeRequired');
        isValid = false;
    }

    return isValid;
};

const handleSubmit = async () => {
    if (!validateForm()) {
        return;
    }

    isSubmitting.value = true;
    formErrors.value.api = ''; // Clear previous API errors

    try {
        const payload = {
            name: locationForm.value.name,
            address: locationForm.value.address,
            latitude: parseFloat(locationForm.value.latitude), // Ensure numbers
            longitude: parseFloat(locationForm.value.longitude), // Ensure numbers
            description: locationForm.value.description // Include description in payload
        };

        if (locationForm.value.id) {
            await apiService.updateLocation(locationForm.value.id, payload);
            console.log('Location updated successfully!'); // Consider translating this log message too
        } else {
            await apiService.createLocation(payload);
            console.log('Location created successfully!'); // Consider translating this log message too
        }
        emits('locationSaved'); // Notify parent that a location was saved
        handleClose(); // Close the modal
    } catch (error) {
        console.error('Error saving location:', error.response?.data || error.message); // Consider translating this log message too
        formErrors.value.api = error.response?.data?.message || i18n.global.t('locations.errorSavingLocation');
    } finally {
        isSubmitting.value = false;
    }
};

const handleClose = () => {
    resetForm(); // Always reset form when closing
    emits('close'); // Emit close event to parent
};

const handleAddressInputBlur = () => {
    // We put a small delay here to allow the mousedown.prevent on a suggestion
    // to fire before the list is hidden. If a suggestion was clicked,
    // selectSuggestion will have already set showSuggestions to false.
    // This blur handler only catches blurs that are NOT due to clicking a suggestion.
    setTimeout(() => {
        if (showSuggestions.value) { // Only hide if selectSuggestion didn't already
            showSuggestions.value = false;
        }
    }, 150); // A slightly longer delay might be needed for some browsers/users
};

</script>

<template>
    <div v-if="show" class="modal-backdrop fade show"></div>

    <div class="modal fade" :class="{ 'show d-block': show }" tabindex="-1" role="dialog" aria-hidden="true" @click.self="handleClose">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ locationForm.id ? $t('locations.editLocation') : $t('locations.createNewLocation') }}</h5>
                    <button type="button" class="close" @click="handleClose" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div v-if="formErrors.api" class="alert alert-danger" role="alert">
                        {{ formErrors.api }}
                    </div>
                    <form @submit.prevent="handleSubmit">
                        <div class="form-group">
                            <label for="locationName">{{ $t('locations.name') }}</label>
                            <input type="text" class="form-control" :class="{ 'is-invalid': formErrors.name }" id="locationName" v-model="locationForm.name">
                            <div class="invalid-feedback" v-if="formErrors.name">{{ formErrors.name }}</div>
                        </div>
                        <div class="form-group">
                            <label for="locationAddress">{{ $t('locations.address') }}</label>
                            <input
                                type="text"
                                class="form-control"
                                :class="{ 'is-invalid': formErrors.address }"
                                id="locationAddress"
                                v-model="locationForm.address"
                                @input="lookupAddress"
                                @focus="showSuggestions = suggestions.length > 0"
                                @blur="handleAddressInputBlur"
                            >
                            <div class="invalid-feedback" v-if="formErrors.address">{{ formErrors.address }}</div>
                            <div v-if="formErrors.addressLookup" class="alert alert-warning mt-1">{{ formErrors.addressLookup }}</div>

                            <ul class="list-group suggestions-list" v-if="showSuggestions">
                                <li
                                    v-for="suggestion in suggestions"
                                    :key="suggestion.place_id"
                                    class="list-group-item list-group-item-action"
                                    @mousedown.prevent="selectSuggestion(suggestion)" >
                                    {{ suggestion.display_name }}
                                </li>
                            </ul>
                        </div>
                        <div class="form-group">
                            <label for="locationLatitude">{{ $t('locations.latitude') }}</label>
                            <input type="number" step="any" class="form-control" :class="{ 'is-invalid': formErrors.latitude }" id="locationLatitude" v-model="locationForm.latitude">
                            <div class="invalid-feedback" v-if="formErrors.latitude">{{ formErrors.latitude }}</div>
                        </div>
                        <div class="form-group">
                            <label for="locationLongitude">{{ $t('locations.longitude') }}</label>
                            <input type="number" step="any" class="form-control" :class="{ 'is-invalid': formErrors.longitude }" id="locationLongitude" v-model="locationForm.longitude">
                            <div class="invalid-feedback" v-if="formErrors.longitude">{{ formErrors.longitude }}</div>
                        </div>
                        <div class="form-group">
                            <label for="locationDescription">{{ $t('locations.description') }}</label>
                            <textarea class="form-control" id="locationDescription" v-model="locationForm.description" rows="3"></textarea>
                        </div>

                        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                            {{ isSubmitting ? $t('common.saving') : (locationForm.id ? $t('locations.updateLocation') : $t('locations.createLocation')) }}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>
/* Reuse modal styles from TripFormModal for consistency */
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1040;
}
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    outline: 0;
    z-index: 1050;
    display: none; /* Hidden by default, controlled by JS class */
}
.modal.show.d-block {
    display: block !important;
}

/* Autocomplete specific styles */
.suggestions-list {
    position: absolute; /* Position relative to its parent .form-group */
    z-index: 1060; /* Ensure it's above other elements but below modal */
    width: calc(100% - 30px); /* Adjust based on your form-group padding */
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-top: none;
    box-shadow: 0px 4px 8px rgba(0,0,0,0.1);
    background-color: white;
}
.list-group-item {
    cursor: pointer;
}
.list-group-item:hover {
    background-color: #f8f9fa;
}
</style>
