<script setup>
import { ref } from 'vue';
import TripList from '@/components/TripList.vue';
import TripFormModal from '@/components/TripFormModal.vue'; // Import the new modal component
import { apiService } from '@/services/apiService'; // Needed for delete
import Swal from 'sweetalert2'; // For confirmation dialogs, install with: npm install sweetalert2

const tripListRef = ref(null); // Ref to TripList component

// State for the modal
const showTripFormModal = ref(false);
const currentTripToEdit = ref(null); // Holds trip data when editing

// Method to open modal for creating a new trip
const openCreateTripModal = () => {
    currentTripToEdit.value = null; // Ensure form is reset for new trip
    showTripFormModal.value = true;
};

// Method to handle 'edit-trip' event from TripList
const handleEditTrip = (trip) => {
    currentTripToEdit.value = { ...trip }; // Pass a copy of the trip data to the form
    showTripFormModal.value = true;
};

// Method to handle 'delete-trip' event from TripList
const handleDeleteTrip = async (tripId) => {
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
            await apiService.deleteTrip(tripId);
            Swal.fire(
                'Slettet!',
                'Turen er blevet slettet.',
                'success'
            );
            // Refresh the trip list after deletion
            if (tripListRef.value && tripListRef.value.fetchTrips) {
                tripListRef.value.fetchTrips();
            }
        } catch (error) {
            console.error('Error deleting trip:', error);
            Swal.fire(
                'Fejl!',
                'Kunne ikke slette turen. Prøv igen.',
                'error'
            );
        }
    }
};

// Method to handle 'tripSaved' event from TripFormModal (after create/update)
const handleTripSaved = () => {
    showTripFormModal.value = false; // Close the modal
    // Refresh the trip list
    if (tripListRef.value && tripListRef.value.fetchTrips) {
        tripListRef.value.fetchTrips();
    }
};

// Method to handle 'close' event from TripFormModal
const handleCloseModal = () => {
    showTripFormModal.value = false;
};
</script>

<template>
    <div class="container-fluid">
        <h1 class="h3 mb-2 text-gray-800">Ture Oversigt</h1>
        <p class="mb-4">Her kan du se, oprette, redigere og slette dine ture.</p>

        <div class="mb-3">
            <button class="btn btn-success" @click="openCreateTripModal">
                <i class="fas fa-plus"></i> Opret ny tur
            </button>
        </div>

        <TripList
            ref="tripListRef"
            @edit-trip="handleEditTrip"
            @delete-trip="handleDeleteTrip"
        />

        <TripFormModal
            :show="showTripFormModal"
            :tripData="currentTripToEdit"
            @close="handleCloseModal"
            @tripSaved="handleTripSaved"
        />
    </div>
</template>

<style scoped>
/* Scoped styles for TripView if any */
</style>