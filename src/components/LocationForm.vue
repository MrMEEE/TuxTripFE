<script setup>
import { ref, watch } from 'vue';
import { apiService } from '@/services/apiService';
import { useI18n } from 'vue-i18n'; // Import useI18n

const props = defineProps({
    editingLocation: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['locationCreated', 'locationUpdated']);
const i18n = useI18n(); // Initialize useI18n

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
            errorMessage.value = error.message || i18n.global.t('locations.errorAddressLookup'); // Translated
            console.error(i18n.global.t('locations.errorAddressLookup'), error); // Translated
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
        errorMessage.value = i18n.global.t('locations.nameRequired') + ", " + i18n.global.t('locations.addressRequired') + ", " + i18n.global.t('locations.latitudeRequired') + " " + i18n.global.t('common.and') + " " + i18n.global.t('locations.longitudeRequired'); // Translated
        return;
    }

    const latNum = parseFloat(latitude.value);
    const lonNum = parseFloat(longitude.value);

    if (isNaN(latNum) || isNaN(lonNum)) {
        errorMessage.value = i18n.global.t('locations.latitude') + " " + i18n.global.t('common.and') + " " + i18n.global.t('locations.longitude') + " " + i18n.global.t('common.mustBeValidNumbers'); // Translated
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
            successMessage.value = response.message || i18n.global.t('locations.locationUpdatedSuccessfully'); // Translated
            emit('locationUpdated');
        } else {
            response = await apiService.createLocation(locationData);
            successMessage.value = response.message || i18n.global.t('locations.locationCreatedSuccessfully'); // Translated
            emit('locationCreated');
        }

        showSuccess.value = true;
        resetForm();

        setTimeout(() => {
            showSuccess.value = false;
            successMessage.value = '';
        }, 5000);
    } catch (error) {
        errorMessage.value = error.message || i18n.global.t('locations.errorSavingLocation'); // Translated
        console.error(i18n.global.t('locations.errorCreatingUpdatingLocation'), error); // Translated
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
            <h6 class="m-0 font-weight-bold text-primary">{{ editingLocation ? $t('locations.editLocation') : $t('locations.createNewLocation') }}</h6>
        </div>
        <div class="card-body">
            <!-- Alert for success/error messages -->
            <div v-if="errorMessage" class="alert alert-danger" role="alert">
                {{ errorMessage }}
            </div>
            <div v-if="showSuccess" class="alert alert-success" role="alert">
                {{ successMessage }}
            </div>

            <form @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label for="name">{{ $t('locations.name') }}</label>
                    <input type="text" class="form-control" id="name" v-model="name" required>
                </div>
                <div class="form-group">
                    <label for="address">{{ $t('locations.address') }}</label>
                    <input
                        type="text"
                        class="form-control"
                        id="address"
                        v-model="address"
                        @input="lookupAddress"
                        @focus="showSuggestions = suggestions.length > 0"
                        @blur="showSuggestions = false"
                        required
                    >
                    <ul class="list-group" v-if="showSuggestions">
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
                <div class="form-group">
                    <label for="latitude">{{ $t('locations.latitude') }}</label>
                    <input type="number" step="any" class="form-control" id="latitude" v-model="latitude" required>
                </div>
                <div class="form-group">
                    <label for="longitude">{{ $t('locations.longitude') }}</label>
                    <input type="number" step="any" class="form-control" id="longitude" v-model="longitude" required>
                </div>
                <div class="form-group">
                    <label for="description">{{ $t('locations.description') }}</label>
                    <textarea class="form-control" id="description" v-model="description" rows="3"></textarea>
                </div>
                <button type="submit" class="btn btn-primary mt-3">
                    {{ editingLocation ? $t('locations.updateLocation') : $t('locations.createLocation') }}
                </button>
            </form>
        </div>
        <!-- This button was likely a copy-paste error as it's outside the card-body and duplicates modal functionality -->
        <!-- <button class="btn btn-success btn-sm" @click="openCreateLocationModal">
            <i class="fas fa-plus"></i> Opret Ny Lokation
        </button> -->
    </div>
</template>

<style scoped>
/* Add any specific styles for LocationsForm here */
.list-group {
    max-height: 200px; /* Limit height of suggestion list */
    overflow-y: auto; /* Enable scrolling for suggestions */
    position: absolute; /* Position relative to its parent */
    z-index: 1000; /* Ensure it's above other content */
    width: 100%;
    border: 1px solid #ddd;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    background-color: white;
}
.list-group-item {
    cursor: pointer;
    padding: 8px 15px;
    border-bottom: 1px solid #eee;
}
.list-group-item:last-child {
    border-bottom: none;
}
.list-group-item:hover {
    background-color: #f8f9fa;
}
</style>
