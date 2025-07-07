<script setup>
import { ref, onMounted } from 'vue';
import { apiService } from '@/services/apiService';
import { defineExpose } from 'vue'; // <--- Import defineExpose

const trips = ref([]);
const errorMessage = ref('');
const loading = ref(true);

const fetchTrips = async () => {
    loading.value = true;
    errorMessage.value = '';
    try {
        trips.value = await apiService.getTrips();
    } catch (error) {
        errorMessage.value = error.message || 'Fejl ved hentning af ture.';
        console.error('Fejl ved hentning af ture:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchTrips);

// <--- ADD THIS LINE TO EXPOSE fetchTrips TO THE PARENT COMPONENT
defineExpose({
    fetchTrips
});
</script>

<template>
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Dine ture</h6>
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
            <div v-else-if="trips.length === 0" class="alert alert-info" role="alert">
                Ingen ture fundet. Opret din første tur!
            </div>
            <div v-else class="table-responsive">
                <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
                    <thead>
                        <tr>
                            <th>Dato</th>
                            <th>Fra</th>
                            <th>Til</th>
                            <th>Formål</th>
                            <th>Afstand (km)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="trip in trips" :key="trip.id">
                            <td>{{ trip.date }}</td>
                            <td>{{ trip.start_location ? trip.start_location.name : 'Ukendt' }}</td>
                            <td>{{ trip.end_location ? trip.end_location.name : 'Ukendt' }}</td>
                            <td>{{ trip.purpose }}</td>
                            <td>{{ trip.distance_km ? trip.distance_km + ' km' : 'N/A' }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Dine styles */
</style>