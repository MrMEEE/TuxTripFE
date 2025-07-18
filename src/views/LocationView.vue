<script setup>
import { ref } from 'vue';
import LocationForm from '@/components/LocationForm.vue';
import LocationList from '@/components/LocationList.vue';
import { apiService } from '@/services/apiService';
import Swal from 'sweetalert2';
import { useI18n } from 'vue-i18n'; // Import useI18n

const locationListRef = ref(null); // Ref to access methods in LocationList
const editingLocation = ref(null); // State to hold the location being edited
const i18n = useI18n(); // Initialize useI18n


const handleEditLocation = (location) => {
    editingLocation.value = { ...location }; // Create a copy to prevent direct mutation
};

// Method to handle 'delete-location' event from LocationList
const handleDeleteLocation = async (locationId) => {
    // Show a confirmation dialog before deleting
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
                i18n.global.t('common.deleted'),
                i18n.global.t('locations.locationDeleted'),
                'success'
            );
            // Refresh the trip list after deletion
            if (locationListRef.value && locationListRef.value.fetchLocations) {
                console.log('Confirmed: locationListRef.value is NOT null:', locationListRef.value); // Consider translating this log message too
                console.log('Confirmed: fetchLocations method exists:', typeof locationListRef.value.fetchLocations); // Consider translating this log message too
                locationListRef.value.fetchLocations();
            }else {
                console.warn('locationListRef.value is:', locationListRef.value); // Consider translating this log message too
                console.warn('locationListRef.value.fetchLocations is:', locationListRef.value ? locationListRef.value.fetchLocations : 'not applicable (ref is null)'); // Consider translating this log message too
            }
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
</script>

<template>
    <div class="container-fluid">
        <h1 class="h3 mb-4 text-gray-800">{{ $t('locations.title') }}</h1>

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
