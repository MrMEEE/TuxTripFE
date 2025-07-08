<script setup>
import { ref, onMounted, defineExpose, defineEmits, computed } from 'vue'; // Import computed
import { apiService } from '@/services/apiService';
import { format } from 'date-fns'; // Import date-fns for date formatting

const trips = ref([]);
const errorMessage = ref('');
const loading = ref(true);

// Add sorting state
const sortOrder = ref('desc'); // 'asc' for ascending, 'desc' for descending

// Define emits for parent communication
const emits = defineEmits(['edit-trip', 'delete-trip']);

const fetchTrips = async () => {
    loading.value = true;
    errorMessage.value = '';
    try {
        // Assuming apiService.getTrips() returns an array of trip objects
        trips.value = await apiService.getTrips();
    } catch (error) {
        errorMessage.value = error.message || 'Fejl ved hentning af ture.';
        console.error('Fejl ved hentning af ture:', error);
    } finally {
        loading.value = false;
    }
};

// Computed property for sorted trips
const sortedTrips = computed(() => {
    if (!trips.value || trips.value.length === 0) {
        return [];
    }

    // Create a shallow copy to avoid mutating the original array
    const sorted = [...trips.value];

    sorted.sort((a, b) => {
        // Convert date strings to Date objects for accurate comparison
        // Ensure the date string is in a format Date constructor can parse reliably (e.g., YYYY-MM-DD)
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        // Check for invalid dates before comparison
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
            // Handle invalid dates (e.g., put them at the end, or skip sorting for them)
            // For now, if dates are invalid, maintain original order relative to each other
            return 0;
        }

        if (sortOrder.value === 'asc') {
            return dateA.getTime() - dateB.getTime(); // Ascending (oldest first)
        } else {
            return dateB.getTime() - dateA.getTime(); // Descending (newest first)
        }
    });

    return sorted;
});

// Function to toggle sort order
const toggleSortOrder = () => {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
};

// Method to handle edit button click
const handleEdit = (trip) => {
    emits('edit-trip', trip); // Emit 'edit-trip' event with the trip data
};

// Method to handle delete button click
const handleDelete = (tripId) => {
    emits('delete-trip', tripId); // Emit 'delete-trip' event with the trip ID
};

onMounted(fetchTrips);

defineExpose({
    fetchTrips // Keep fetchTrips exposed for refreshing the list from parent
});
</script>

<template>
    <div class="card shadow mb-4">
        <div class="card-header py-3 d-flex justify-content-between align-items-center">
            <h6 class="m-0 font-weight-bold text-primary">Dine ture</h6>
            <button class="btn btn-outline-secondary btn-sm" @click="toggleSortOrder">
                Sortér dato:
                <span v-if="sortOrder === 'asc'">Ældste først <i class="fas fa-arrow-up"></i></span>
                <span v-else>Nyeste først <i class="fas fa-arrow-down"></i></span>
            </button>
        </div>
        <div class="card-body">
            <div v-if="loading" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <p class="mt-2">Henter ture...</p>
            </div>
            <div v-else-if="errorMessage" class="alert alert-danger" role="alert">
                {{ errorMessage }}
            </div>
            <div v-else-if="sortedTrips.length === 0" class="alert alert-info" role="alert">
                Ingen ture fundet. Opret din første tur!
            </div>
            <div v-else class="table-responsive">
                <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
                    <thead>
                        <tr>
                            <th @click="toggleSortOrder" style="cursor: pointer;">
                                Dato
                                <i :class="{ 'fas fa-sort-up': sortOrder === 'asc', 'fas fa-sort-down': sortOrder === 'desc' }"></i>
                            </th>
                            <th>Fra</th>
                            <th>Til</th>
                            <th>Formål</th>
                            <th>Afstand (km)</th>
                            <th>Handlinger</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="trip in sortedTrips" :key="trip.id">
                            <td>{{ format(new Date(trip.date), 'dd-MM-yyyy') }}</td>
                            <td>{{ trip.start_location ? trip.start_location.name : 'Ukendt' }}</td>
                            <td>{{ trip.end_location ? trip.end_location.name : 'Ukendt' }}</td>
                            <td>{{ trip.purpose }}</td>
                            <td>{{ trip.distance_km ? trip.distance_km + ' km' : 'N/A' }}</td>
                            <td>
                                <button @click="handleEdit(trip)" class="btn btn-info btn-sm mr-1">
                                    <i class="fas fa-edit"></i> Rediger
                                </button>
                                <button @click="handleDelete(trip.id)" class="btn btn-danger btn-sm">
                                    <i class="fas fa-trash"></i> Slet
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Dine styles */

/* Basic styling for sortable header */
th {
    user-select: none; /* Prevent text selection when clicking sort icon */
}
</style>