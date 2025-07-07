<script setup>
import { ref, onMounted, defineEmits } from 'vue';
import { apiService } from '@/services/apiService';

const locations = ref([]);
const errorMessage = ref('');
const successMessage = ref(''); // For delete success messages
const showSuccess = ref(false);

const emit = defineEmits(['editLocation']); // Emit event when edit is clicked

const fetchLocations = async () => {
    errorMessage.value = '';
    try {
        const response = await apiService.getLocations();
        locations.value = response;
    } catch (error) {
        errorMessage.value = error.message || 'Fejl ved hentning af lokationer.';
        console.error('Fejl ved hentning af lokationer:', error);
    }
};

const deleteLocation = async (locationId) => {
    errorMessage.value = '';
    showSuccess.value = false;
    if (confirm('Er du sikker på, at du vil slette denne lokation?')) {
        try {
            const response = await apiService.deleteLocation(locationId);
            successMessage.value = response.message || 'Lokation slettet succesfuldt!';
            showSuccess.value = true;
            fetchLocations(); // Refresh the list
            setTimeout(() => { showSuccess.value = false; successMessage.value = ''; }, 3000);
        } catch (error) {
            errorMessage.value = error.message || 'Fejl ved sletning af lokation.';
            console.error('Fejl ved sletning af lokation:', error);
        }
    }
};

const editLocation = (location) => {
    emit('editLocation', location); // Emit the location object to parent
};

onMounted(fetchLocations);

// Expose fetchLocations so parent can call it (e.g., after creating a new location)
defineExpose({
    fetchLocations
});
</script>

<template>
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Dine Lokationer</h6>
        </div>
        <div class="card-body">
            <div v-if="errorMessage" class="alert alert-danger" role="alert">
                {{ errorMessage }}
            </div>
            <div v-if="showSuccess" class="alert alert-success" role="alert">
                {{ successMessage }}
            </div>
            <div v-if="locations.length === 0" class="alert alert-info">
                Ingen lokationer fundet. Opret en ny lokation ovenfor.
            </div>
            <div v-else class="table-responsive">
                <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
                    <thead>
                        <tr>
                            <th>Navn</th>
                            <th>Adresse</th>
                            <th>Breddegrad</th>
                            <th>Længdegrad</th>
                            <th>Oprettet</th>
                            <th>Handling</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="location in locations" :key="location.id">
                            <td>{{ location.name }}</td>
                            <td>{{ location.address }}</td>
                            <td>{{ location.latitude }}</td>
                            <td>{{ location.longitude }}</td>
                            <td>{{ new Date(location.created_at).toLocaleDateString() }}</td>
                            <td>
                                <button @click="editLocation(location)" class="btn btn-warning btn-sm me-2">Rediger</button>
                                <button @click="deleteLocation(location.id)" class="btn btn-danger btn-sm">Slet</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Add any specific styles here if needed */
</style>