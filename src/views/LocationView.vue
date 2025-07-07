<script setup>
import { ref } from 'vue';
import LocationForm from '@/components/LocationForm.vue';
import LocationList from '@/components/LocationList.vue';

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
</script>

<template>
    <div class="container-fluid">
        <h1 class="h3 mb-4 text-gray-800">Lokationer</h1>

        <div class="row">
            <div class="col-12 mb-4"> <LocationForm
                    @location-created="handleLocationCreated"
                    @location-updated="handleLocationUpdated"
                    :editing-location="editingLocation"
                    ref="locationFormRef"
                />
            </div>
        </div>

        <div class="row">
            <div class="col-12"> <LocationList
                    @edit-location="handleEditLocation"
                    @location-deleted="handleLocationCreated"
                    ref="locationListRef"
                />
            </div>
        </div>
    </div>
</template>