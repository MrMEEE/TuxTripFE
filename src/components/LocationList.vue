<script setup>
import { ref, onMounted, computed } from 'vue'; // Import 'computed'
import { apiService } from '@/services/apiService';

const emit = defineEmits(['edit-location', 'location-deleted']);

const locations = ref([]);
const errorMessage = ref('');
const loading = ref(true);

// --- Sorting State ---
const sortColumn = ref('name'); // Default sort column
const sortOrder = ref('asc'); // Default sort order ('asc' or 'desc')

// Function to fetch all locations (no sorting parameters needed here)
const fetchLocations = async () => {
    loading.value = true;
    errorMessage.value = '';
    try {
        const response = await apiService.getLocations(); // No sort params sent to backend
        locations.value = response;
    } catch (error) {
        errorMessage.value = error.message || 'Fejl ved hentning af lokationer.';
        console.error('Fejl ved hentning af lokationer:', error);
    } finally {
        loading.value = false;
    }
};

// Computed property for sorted locations
const sortedLocations = computed(() => {
    if (!locations.value || locations.value.length === 0) {
        return [];
    }

    // Create a shallow copy to avoid mutating the original array
    // and ensure reactivity triggers
    const sortedArray = [...locations.value];

    // Sort the array
    sortedArray.sort((a, b) => {
        const valueA = a[sortColumn.value];
        const valueB = b[sortColumn.value];

        // Handle null/undefined values by treating them as smaller/larger as appropriate
        // Or you can make a more complex comparison logic
        if (valueA === null || valueA === undefined) return sortOrder.value === 'asc' ? -1 : 1;
        if (valueB === null || valueB === undefined) return sortOrder.value === 'asc' ? 1 : -1;

        // Basic string/number comparison
        if (typeof valueA === 'string' && typeof valueB === 'string') {
            return sortOrder.value === 'asc'
                ? valueA.localeCompare(valueB)
                : valueB.localeCompare(valueA);
        } else {
            // For numbers or other comparable types
            return sortOrder.value === 'asc'
                ? valueA - valueB
                : valueB - valueA;
        }
    });

    return sortedArray;
});


// Function to handle column header clicks for sorting
const handleSort = (column) => {
    if (sortColumn.value === column) {
        // If clicking the same column, toggle order
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
        // If clicking a new column, set it as the sort column and default to asc
        sortColumn.value = column;
        sortOrder.value = 'asc';
    }
    // No need to call fetchLocations() again here,
    // the 'computed' property will react to sortColumn/sortOrder changes.
};

// Helper to get the sort icon
const getSortIcon = (column) => {
    if (sortColumn.value === column) {
        return sortOrder.value === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    }
    return 'fa-sort'; // Default icon for non-sorted columns
};

const editLocation = (location) => {
    emit('edit-location', location);
};

const deleteLocation = async (id) => {
    if (confirm('Er du sikker på, at du vil slette denne lokation?')) {
        try {
            await apiService.deleteLocation(id);
            emit('location-deleted'); // Notify parent to refresh list
            // Or if you only want frontend delete without refetch:
            // locations.value = locations.value.filter(loc => loc.id !== id);
        } catch (error) {
            errorMessage.value = error.message || 'Fejl ved sletning af lokation.';
            console.error('Fejl ved sletning af lokation:', error);
        }
    }
};

onMounted(() => {
    fetchLocations();
});

// Expose fetchLocations to parent component (LocationView.vue)
defineExpose({
    fetchLocations // Still expose if parent needs to trigger a full refresh
});
</script>

<template>
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Lokationsliste</h6>
        </div>
        <div class="card-body">
            <div v-if="loading" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
            <div v-else-if="errorMessage" class="alert alert-danger" role="alert">
                {{ errorMessage }}
            </div>
            <div v-else-if="locations.length === 0" class="alert alert-info" role="alert">
                Ingen lokationer fundet.
            </div>
            <div v-else class="table-responsive">
                <table class="table table-bordered" id="locationsTable" width="100%" cellspacing="0">
                    <thead>
                        <tr>
                            <th @click="handleSort('name')" :class="{ 'text-primary': sortColumn === 'name' }" style="cursor: pointer;">
                                Navn <i class="fas" :class="getSortIcon('name')"></i>
                            </th>
                            <th @click="handleSort('address')" :class="{ 'text-primary': sortColumn === 'address' }" style="cursor: pointer;">
                                Adresse <i class="fas" :class="getSortIcon('address')"></i>
                            </th>
                            <th>Breddegrad</th>
                            <th>Længdegrad</th>
                            <th>Beskrivelse</th>
                            <th>Handlinger</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="location in sortedLocations" :key="location.id">
                            <td>{{ location.name }}</td>
                            <td>{{ location.address }}</td>
                            <td>{{ location.latitude }}</td>
                            <td>{{ location.longitude }}</td>
                            <td>{{ location.description }}</td>
                            <td>
                                <button @click="editLocation(location)" class="btn btn-warning btn-sm me-1">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button @click="deleteLocation(location.id)" class="btn btn-danger btn-sm">
                                    <i class="fas fa-trash"></i>
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
/* Add any specific styles for LocationList here */
/* For pointer cursor on sortable headers */
th[style*="cursor: pointer;"] {
    user-select: none; /* Prevent text selection when clicking for sort */
}
</style>