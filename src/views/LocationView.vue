<script setup>
import { ref } from 'vue';
import LocationForm from '@/components/LocationForm.vue';
import LocationList from '@/components/LocationList.vue';
import { apiService } from '@/services/apiService';
import Swal from 'sweetalert2';

const locationListRef = ref(null); // Ref to access methods in LocationList
const editingLocation = ref(null); // State to hold the location being edited


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
                console.log('Confirmed: locationListRef.value is NOT null:', locationListRef.value); // Should see this if it's not null
                console.log('Confirmed: fetchLocations method exists:', typeof locationListRef.value.fetchLocations); // Should see 'function'
                locationListRef.value.fetchLocations();
            }else {
                console.warn('locationListRef.value is:', locationListRef.value); // What is its actual value?
                console.warn('locationListRef.value.fetchLocations is:', locationListRef.value ? locationListRef.value.fetchLocations : 'not applicable (ref is null)'); // More precise
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