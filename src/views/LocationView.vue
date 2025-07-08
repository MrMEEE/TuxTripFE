<script setup>
import { ref } from 'vue';
import LocationForm from '@/components/LocationForm.vue';
import LocationList from '@/components/LocationList.vue';
import { apiService } from '@/services/apiService';
import Swal from 'sweetalert2';

const locationListRef = ref(null); // Ref to access methods in LocationList
const locationFormRef = ref(null); // Ref to access methods in LocationForm

const editingLocation = ref(null); // State to hold the location being edited

const handleLocationCreated = () => {
    // When a location is created, refresh the list
    if (locationListRef.value) {
        locationListRef.value.fetchLocations();
    }
};

const handleLocationUpdated = () => {
    // When a location is updated, refresh the list and clear editing state
    if (locationListRef.value) {
        locationListRef.value.fetchLocations();
    }
    editingLocation.value = null; // Exit edit mode
    // locationFormRef.value.resetForm(); // Reset the form after update
};

const handleEditLocation = (location) => {
    editingLocation.value = { ...location }; // Create a copy to prevent direct mutation
};

// Method to handle 'delete-location' event from LocationList
const handleDeleteLocation = async (locationId) => {
    // Show a confirmation dialog before deleting
    const result = await Swal.fire({
        title: 'Er du sikker?',
        text: "Du kan ikke fortryde dette!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ja, slet den!',
        cancelButtonText: 'Annuller'
    });

    if (result.isConfirmed) {
        try {
            await apiService.deleteLocation(locationId);
            Swal.fire(
                'Slettet!',
                'Lokationen er blevet slettet.',
                'success'
            );
            // Refresh the trip list after deletion
            if (locationListRef.value && locationListRef.value.fetchLocations) {
                locationListRef.value.fetchLocations();
            }
        } catch (error) {
            console.error('Error deleting location:', error);
            Swal.fire(
                'Fejl!',
                'Kunne ikke slette lokationen. Prøv igen.',
                'error'
            );
        }
    }
};
</script>

<template>
    <div class="container-fluid">
        <h1 class="h3 mb-4 text-gray-800">Lokationer</h1>

        

        <div class="mb-3">
            <button class="btn btn-success btn-sm" @click="openCreateLocationModal">
                <i class="fas fa-plus"></i> Opret Ny Lokation
            </button>
        </div>


        <div class="row">
            <div class="col-12"> <LocationList
                    @edit-location="handleEditLocation"
                    @delete-location="handleDeleteLocation"
                    ref="locationListRef"
                />
            </div>
        </div>
    </div>
</template>