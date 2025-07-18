<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { apiService } from '@/services/apiService';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import TripFormModal from '@/components/TripFormModal.vue'; // Import the modal
import { useI18n } from 'vue-i18n'; // Import useI18n

const trips = ref([]);
const errorMessage = ref('');
const loading = ref(true);
const i18n = useI18n(); // Initialize useI18n

// Modal state
const showTripFormModal = ref(false);
const currentTripToEdit = ref(null); // Holds trip data when editing

// Add sorting state
const sortOrder = ref('desc'); // 'asc' for ascending, 'desc' for descending

const fetchTrips = async () => {
    loading.value = true;
    errorMessage.value = '';
    try {
        trips.value = await apiService.getTrips();
    } catch (error) {
        errorMessage.value = error.message || i18n.global.t('trips.errorFetchingTrips');
        console.error('Error fetching trips:', error);
    } finally {
        loading.value = false;
    }
};

const sortedTrips = computed(() => {
    if (!trips.value || trips.value.length === 0) {
        return [];
    }
    const sorted = [...trips.value];
    sorted.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
            return 0;
        }
        if (sortOrder.value === 'asc') {
            return dateA.getTime() - dateB.getTime();
        } else {
            return dateB.getTime() - dateA.getTime();
        }
    });
    return sorted;
});

const toggleSortOrder = () => {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
};

// --- Modal Handling ---
const openCreateTripModal = () => {
    currentTripToEdit.value = null; // Ensure form is reset for new trip
    showTripFormModal.value = true;
};

const handleEdit = (trip) => {
    currentTripToEdit.value = { ...trip }; // Pass a copy
    showTripFormModal.value = true;
};

const handleTripSaved = () => {
    showTripFormModal.value = false;
    fetchTrips(); // Refresh the list
};

const handleCloseModal = () => {
    showTripFormModal.value = false;
    currentTripToEdit.value = null; // Clear edit data on close
};

// --- Action Handlers ---
const handleDelete = async (tripId) => {
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
            await apiService.deleteTrip(tripId);
            Swal.fire(
                i18n.global.t('common.deleted'), // Assuming 'Deleted!' maps to common.deleted
                i18n.global.t('trips.tripDeleted'),
                'success'
            );
            fetchTrips();
        } catch (error) {
            console.error('Error deleting trip:', error);
            Swal.fire(
                i18n.global.t('common.error'),
                error.response?.data?.message || i18n.global.t('trips.errorDeletingTrip'),
                'error'
            );
        }
    }
};

onMounted(fetchTrips);
</script>

<template>
    <div class="card shadow mb-4">
        <div class="card-header py-3 d-flex justify-content-between align-items-center">
            <h6 class="m-0 font-weight-bold text-primary">{{ $t('trips.yourTrips') }}</h6>
            <button class="btn btn-success btn-sm" @click="openCreateTripModal">
                <i class="fas fa-plus"></i> {{ $t('trips.createNewTrip') }}
            </button>
        </div>
        <div class="card-body">
            <div v-if="loading" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">{{ $t('common.loading') }}</span>
                </div>
                <p class="mt-2">{{ $t('trips.fetchingTrips') }}</p>
            </div>
            <div v-else-if="errorMessage" class="alert alert-danger" role="alert">
                {{ errorMessage }}
            </div>
            <div v-else-if="sortedTrips.length === 0" class="alert alert-info" role="alert">
                {{ $t('trips.noTripsFound') }}
            </div>
            <div v-else class="table-responsive">
                <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
                    <thead>
                        <tr>
                            <th @click="toggleSortOrder" style="cursor: pointer;">
                                {{ $t('trips.date') }}
                                <i :class="{ 'fas fa-sort-up': sortOrder === 'asc', 'fas fa-sort-down': sortOrder === 'desc' }"></i>
                            </th>
                            <th>{{ $t('trips.from') }}</th>
                            <th>{{ $t('trips.to') }}</th>
                            <th>{{ $t('trips.purpose') }}</th>
                            <th>{{ $t('trips.distanceKm') }}</th>
                            <th>{{ $t('common.actions') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="trip in sortedTrips" :key="trip.id">
                            <td>{{ format(new Date(trip.date), 'dd-MM-yyyy') }}</td>
                            <td>{{ trip.start_location ? trip.start_location.name : $t('common.unknown') }}</td>
                            <td>{{ trip.end_location ? trip.end_location.name : $t('common.unknown') }}</td>
                            <td>{{ trip.purpose }}</td>
                            <td>{{ trip.distance_km ? trip.distance_km + ' km' : 'N/A' }}</td>
                            <td>
                                <button @click="handleEdit(trip)" class="btn btn-info btn-sm mr-1">
                                    <i class="fas fa-edit"></i> {{ $t('common.edit') }}
                                </button>
                                <button @click="handleDelete(trip.id)" class="btn btn-danger btn-sm">
                                    <i class="fas fa-trash"></i> {{ $t('common.delete') }}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <TripFormModal
            :show="showTripFormModal"
            :tripData="currentTripToEdit"
            @close="handleCloseModal"
            @tripSaved="handleTripSaved"
        />
    </div>
</template>

<style scoped>
/* Your existing styles */
th {
    user-select: none;
}
</style>
