<script setup>
import { ref, onMounted, computed, defineExpose, defineEmits } from 'vue'; // <--- Ensure defineExpose is imported here!
import { apiService } from '@/services/apiService';
import LocationFormModal from './LocationFormModal.vue'; // Import the new modal component
import Swal from 'sweetalert2'; // Import Swal
import { useI18n } from 'vue-i18n'; // Import useI18n

const locations = ref([]);
const errorMessage = ref('');
const loading = ref(true);
const i18n = useI18n(); // Initialize useI18n

// Modal state
const showLocationModal = ref(false);
const currentLocation = ref(null); // To hold data for editing

// Sorting state
const sortOrder = ref('asc'); // Default to ascending for location names

const emits = defineEmits(['delete-location']);

// Computed property for sorted locations
const sortedLocations = computed(() => {
    if (!locations.value || locations.value.length === 0) {
        return [];
    }
    const sorted = [...locations.value];
    sorted.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();

        if (sortOrder.value === 'asc') {
            return nameA.localeCompare(nameB);
        } else {
            return nameB.localeCompare(nameA);
        }
    });
    return sorted;
});

// Function to toggle sort order
const toggleSortOrder = () => {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
};


const fetchLocations = async () => {
    console.log('LocationList: fetchLocations method called.'); // Consider translating this log message too
    loading.value = true;
    errorMessage.value = '';
    try {
        locations.value = await apiService.getLocations();
        console.log('LocationList: Locations fetched successfully:', locations.value.length, 'items.'); // Consider translating this log message too
    } catch (error) {
        errorMessage.value = error.message || i18n.global.t('locations.errorFetchingLocations');
        console.error('LocationList: Error fetching locations:', error); // Consider translating this log message too
    } finally {
        loading.value = false;
    }
};

// Functions to open and close the modal
const openCreateLocationModal = () => {
    currentLocation.value = null; // Clear any existing data for new creation
    showLocationModal.value = true;
};

const openEditLocationModal = (location) => {
    currentLocation.value = location; // Set location data for editing
    showLocationModal.value = true;
};

const handleLocationModalClose = () => {
    showLocationModal.value = false;
    currentLocation.value = null; // Clear current location when closing
};

const handleLocationSaved = () => {
    fetchLocations(); // Refresh the list after a location is saved
};

// Method to handle delete button click
const handleDeleteLocation = async (locationId) => {
    const result = await Swal.fire({
        title: i18n.global.t('common.areYouSure'),
        text: i18n.global.t('common.cannotRevert'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: i18n.global.t('common.yesDeleteIt'),
        cancelButtonText: i18n.global.t('common.cancel')
    });

    if (result.isConfirmed) {
        try {
            await apiService.deleteLocation(locationId);
            Swal.fire(
                i18n.global.t('locations.locationDeleted'),
                i18n.global.t('locations.locationDeleted'), // Re-using for consistency
                'success'
            );
            fetchLocations(); // Directly call fetchLocations here
        } catch (error) {
            console.error('Error deleting location:', error); // Consider translating this log message too
            Swal.fire(
                i18n.global.t('common.error'),
                error.response?.data?.message || i18n.global.t('locations.errorDeletingLocation'),
                'error'
            );
        }
    }
};

onMounted(fetchLocations);

// >>>>>>>>>>>>>>>>>>>>>> ADD THIS LINE <<<<<<<<<<<<<<<<<<<<<<<<
defineExpose({
    fetchLocations // Expose the fetchLocations function to the parent component
});
</script>

<template>
    <div class="card shadow mb-4">
        <div class="card-header py-3 d-flex justify-content-between align-items-center">
            <h6 class="m-0 font-weight-bold text-primary">{{ $t('locations.yourLocations') }}</h6>
            <button class="btn btn-success btn-sm" @click="openCreateLocationModal">
                <i class="fas fa-plus"></i> {{ $t('locations.createNewLocation') }}
            </button>
        </div>
        <div class="card-body">
            <div v-if="loading" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">{{ $t('common.loading') }}</span>
                </div>
                <p class="mt-2">{{ $t('locations.fetchingLocations') }}</p>
            </div>
            <div v-else-if="errorMessage" class="alert alert-danger" role="alert">
                {{ errorMessage }}
            </div>
            <div v-else-if="sortedLocations.length === 0" class="alert alert-info" role="alert">
                {{ $t('locations.noLocationsFound') }}
            </div>
            <div v-else class="table-responsive">
                <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
                    <thead>
                        <tr>
                            <th @click="toggleSortOrder" style="cursor: pointer;">
                                {{ $t('locations.name') }}
                                <i :class="{ 'fas fa-sort-up': sortOrder === 'asc', 'fas fa-sort-down': sortOrder === 'desc' }"></i>
                            </th>
                            <th>{{ $t('locations.address') }}</th>
                            <th>{{ $t('locations.latitude') }}</th>
                            <th>{{ $t('locations.longitude') }}</th>
                            <th>{{ $t('common.actions') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="location in sortedLocations" :key="location.id">
                            <td>{{ location.name }}</td>
                            <td>{{ location.address }}</td>
                            <td>{{ location.latitude }}</td>
                            <td>{{ location.longitude }}</td>
                            <td>
                                <button @click="openEditLocationModal(location)" class="btn btn-info btn-sm mr-1">
                                    <i class="fas fa-edit"></i> {{ $t('locations.editLocation') }}
                                </button>
                                <button @click="handleDeleteLocation(location.id)" class="btn btn-danger btn-sm">
                                    <i class="fas fa-trash"></i> {{ $t('locations.deleteLocation') }}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <LocationFormModal
            :show="showLocationModal"
            :locationData="currentLocation"
            @close="handleLocationModalClose"
            @locationSaved="handleLocationSaved"
        />
    </div>
</template>

<style scoped>
/* Your existing styles */
th {
    user-select: none;
}
</style>
