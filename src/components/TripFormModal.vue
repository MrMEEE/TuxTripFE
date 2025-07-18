<script setup>
import { ref, watch, defineProps, defineEmits, onMounted, onUnmounted, computed } from 'vue';
import { apiService } from '@/services/apiService';

// Leaflet imports
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Import leaflet-routing-machine and its CSS
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { useI18n } from 'vue-i18n'; // Import useI18n

// FIX: Leaflet icon paths for default markers
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const i18n = useI18n(); // Initialize useI18n

// Define props: show to control visibility, tripData for editing
const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    tripData: {
        type: Object,
        default: null // Will be populated with trip data when editing
    }
});

// Define emits: close to hide modal, tripSaved to notify parent of save
const emits = defineEmits(['close', 'tripSaved']);

// Form state
const tripForm = ref({
    id: null,
    date: '',
    start_location_id: null,
    end_location_id: null,
    purpose: '',
    distance_km: null,
});

const formErrors = ref({});
const isSubmitting = ref(false);
const locations = ref([]); // To store available locations for dropdowns

// --- Map Related State ---
const map = ref(null); // Leaflet map instance
const routeControl = ref(null); // Reference to the Leaflet Routing Machine control
const mapCalculatedDistance = ref(null); // Distance obtained from LRM
const mapApiError = ref(null); // To show errors from map API calls


// Resets the form and map-related state
const resetForm = () => {
    tripForm.value = {
        id: null,
        date: '',
        start_location_id: null,
        end_location_id: null,
        purpose: '',
        distance_km: null,
    };
    formErrors.value = {};
    isSubmitting.value = false;
    mapCalculatedDistance.value = null; // Reset map distance
    mapApiError.value = null; // Reset map error
    clearMapLayers(); // Clear map markers and route (now handled by LRM cleanup)
};

// Function to clear markers and polyline from map - now cleans up LRM control
const clearMapLayers = () => {
    if (routeControl.value) {
        map.value.removeControl(routeControl.value);
        routeControl.value = null;
    }
    // Optionally, if you have other custom layers/markers not managed by LRM, remove them here.
};

// Helper function to get location details (lat/lon) by ID from the `locations` array
const getLocationById = (id) => {
    return locations.value.find(loc => loc.id === id);
};

// Function to set up and manage the Leaflet Routing Machine
const setupRoutingMachine = () => {
    if (!map.value) return; // Map must be initialized

    // If an existing routeControl exists, remove it before creating a new one
    if (routeControl.value) {
        map.value.removeControl(routeControl.value);
        routeControl.value = null; // Clear the reference
    }

    const startLoc = getLocationById(tripForm.value.start_location_id);
    const endLoc = getLocationById(tripForm.value.end_location_id);

    let waypoints = [];
    if (startLoc) {
        waypoints.push(L.latLng(startLoc.latitude, startLoc.longitude));
    }
    if (endLoc) {
        waypoints.push(L.latLng(endLoc.latitude, endLoc.longitude));
    }

    // Initialize the routing control only if there's at least one waypoint
    if (waypoints.length > 0) {
        routeControl.value = L.Routing.control({
            waypoints: waypoints,
            routeWhileDragging: true, // Allows dragging the route line to insert new waypoints
            addWaypoints: true,       // Enables adding waypoints by right-clicking (or other configured method)
            draggableWaypoints: true, // Makes existing waypoints draggable
            fitSelectedRoutes: true,  // Adjusts map view to fit the entire route
            lineOptions: {
                styles: [{ color: 'blue', opacity: 0.7, weight: 6 }] // Styling for the route line
            },
            // CRUCIAL: Configure LRM to use your OSRM backend
            router: L.Routing.osrmv1({
                serviceUrl: 'http://localhost:5001/route/v1', // **Ensure this matches your OSRM Docker port**
                profile: 'driving' // Match your OSRM's loaded profile (e.g., 'driving', 'car', 'bike', 'foot')
            }),
            // geocoder: L.Control.Geocoder.nominatim(), // REMOVED: Requires leaflet-control-geocoder installation
            // localization: 'da' // Optional: for Danish language, if LRM supports it or you customize it
        }).addTo(map.value);

        // Listen for route calculation events
        routeControl.value.on('routesfound', (e) => {
            const routes = e.routes;
            if (routes.length > 0) {
                // The distance is in meters, convert to km
                mapCalculatedDistance.value = (routes[0].summary.totalDistance / 1000).toFixed(2);
                mapApiError.value = null; // Clear any previous errors
            } else {
                mapCalculatedDistance.value = null;
                mapApiError.value = i18n.global.t('trips.noRouteFound');
            }
        });

        routeControl.value.on('routingerror', (e) => {
            console.error('Routing error:', e.error.message);
            mapApiError.value = i18n.global.t('trips.errorCalculatingRoute') + `: ${e.error.message}`;
            mapCalculatedDistance.value = null;
        });

        // Event listener for when waypoints are changed by user interaction
        routeControl.value.on('waypointschanged', (e) => {
            // This event fires when user drags markers or adds waypoints
            // The route is automatically recalculated by LRM.
            // The 'routesfound' event will then update mapCalculatedDistance.
            console.log("Waypoints changed:", e.waypoints); // Consider translating this log message too
        });

    } else if (map.value) {
        // If no locations are selected, reset map view to a default (e.g., Copenhagen area)
        map.value.setView([55.6761, 12.5683], 10);
        mapCalculatedDistance.value = null;
    }
};


// Function to fetch available locations from the API
const fetchLocations = async () => {
    try {
        locations.value = await apiService.getLocations();
    } catch (error) {
        console.error('Error fetching locations:', error); // Consider translating this log message too
    }
};

// Watch for changes in the `tripData` prop (used when editing an existing trip)
watch(() => props.tripData, (newVal) => {
    if (newVal) {
        // Populate form fields with existing trip data
        tripForm.value.id = newVal.id;
        tripForm.value.date = newVal.date;
        tripForm.value.start_location_id = newVal.start_location ? newVal.start_location.id : null;
        tripForm.value.end_location_id = newVal.end_location ? newVal.end_location.id : null;
        tripForm.value.purpose = newVal.purpose;
        tripForm.value.distance_km = newVal.distance_km;
    } else {
        resetForm(); // Reset form for new trip creation
    }
    // Defer setupRoutingMachine to ensure locations are loaded and map is ready
    // Use `nextTick` or a small timeout to ensure DOM is updated for map div
    setTimeout(setupRoutingMachine, 100);
}, { immediate: true });

// Watch for changes in the `show` prop (controls modal visibility)
watch(() => props.show, (newVal) => {
    if (newVal) { // When modal opens
        if (locations.value.length === 0) {
            fetchLocations(); // Fetch locations if not already loaded
        }
        setTimeout(() => {
            if (!map.value) {
                map.value = L.map('tripMap').setView([55.6761, 12.5683], 10); // Default view (Copenhagen)
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map.value);
            }
            map.value.invalidateSize(); // Important for Leaflet maps in hidden containers/modals
            setupRoutingMachine(); // Initialize/update routing control here
        }, 200); // Small delay to ensure modal transitions are complete and map div is ready
    } else { // When modal closes
        // Clean up the map instance and routing control to prevent memory leaks and issues on re-opening
        clearMapLayers(); // This will remove the routeControl
        if (map.value) {
            map.value.remove();
            map.value = null;
        }
    }
});

// Watch for changes in selected start or end locations to dynamically update the map route
watch([() => tripForm.value.start_location_id, () => tripForm.value.end_location_id], () => {
    if (props.show && map.value) { // Only update map if modal is currently visible and map initialized
        setupRoutingMachine(); // Re-run setup to update waypoints
    }
});

// Function to populate the distance_km field with the map's calculated distance
const useMapDistance = () => {
    if (mapCalculatedDistance.value !== null) {
        tripForm.value.distance_km = mapCalculatedDistance.value;
    }
};

const validateForm = () => {
    formErrors.value = {};
    if (!tripForm.value.date) formErrors.value.date = i18n.global.t('trips.dateRequired');
    if (!tripForm.value.start_location_id) formErrors.value.start_location_id = i18n.global.t('trips.startLocationRequired');
    if (!tripForm.value.end_location_id) formErrors.value.end_location_id = i18n.global.t('trips.endLocationRequired');
    if (!tripForm.value.purpose) formErrors.value.purpose = i18n.global.t('trips.purposeRequired');

    if (tripForm.value.distance_km !== null && tripForm.value.distance_km !== '') {
        const parsedDistance = parseFloat(tripForm.value.distance_km);
        if (isNaN(parsedDistance) || parsedDistance <= 0) {
            formErrors.value.distance_km = i18n.global.t('trips.distancePositive');
        }
    }
    return Object.keys(formErrors.value).length === 0;
};

const handleSubmit = async () => {
    if (!validateForm()) {
        return;
    }

    isSubmitting.value = true;
    try {
        const payload = {
            date: tripForm.value.date,
            start_location_id: tripForm.value.start_location_id,
            end_location_id: tripForm.value.end_location_id,
            purpose: tripForm.value.purpose,
            distance_km: tripForm.value.distance_km !== null && tripForm.value.distance_km !== ''
                         ? parseFloat(tripForm.value.distance_km)
                         : null,
        };

        if (tripForm.value.id) {
            await apiService.updateTrip(tripForm.value.id, payload);
            console.log('Trip updated successfully!'); // Consider translating this log message too
        } else {
            await apiService.createTrip(payload);
            console.log('Trip created successfully!'); // Consider translating this log message too
        }
        emits('tripSaved');
        handleClose();
    } catch (error) {
        console.error('Error saving trip:', error.response?.data || error.message); // Consider translating this log message too
        formErrors.value.api = error.response?.data?.message || i18n.global.t('trips.errorSavingTrip');
    } finally {
        isSubmitting.value = false;
    }
};

const handleClose = () => {
    resetForm();
    emits('close');
};

const createReturnTrip = async () => {
    // Ensure both start and end locations are selected for a valid return trip
    if (!tripForm.value.start_location_id || !tripForm.value.end_location_id) {
        mapApiError.value = i18n.global.t('trips.selectStartEndForReturn');
        return;
    }

    isSubmitting.value = true; // Indicate that an operation is in progress

    try {
        // Get the original locations
        const originalStartLoc = getLocationById(tripForm.value.start_location_id);
        const originalEndLoc = getLocationById(tripForm.value.end_location_id);

        if (!originalStartLoc || !originalEndLoc) {
            mapApiError.value = i18n.global.t('trips.couldNotFindLocationDetails');
            isSubmitting.value = false;
            return;
        }

        // Prepare the payload for the NEW return trip
        const returnTripPayload = {
            // Date for the return trip (e.g., same day or next day)
            // For simplicity, let's use the same date for now.
            // You might want to allow user to pick a date or default to tomorrow.
            date: tripForm.value.date, // Or new Date().toISOString().slice(0, 10) for today, or add 1 day
            start_location_id: tripForm.value.end_location_id, // Start of return is end of original
            end_location_id: tripForm.value.start_location_id,   // End of return is start of original
            purpose: `${i18n.global.t('trips.return')}: ${originalEndLoc.name} ${i18n.global.t('common.to')} ${originalStartLoc.name}`, // Dynamic purpose
            // You can decide if the distance should be null (for re-calculation by map)
            // or if it should be copied from mapCalculatedDistance or original tripForm.distance_km
            distance_km: mapCalculatedDistance.value ? parseFloat(mapCalculatedDistance.value) : null,
            // If you want to automatically set it from current form:
            // distance_km: tripForm.value.distance_km ? parseFloat(tripForm.value.distance_km) : null,
        };

        // Validate payload if needed, although API should handle it
        // (You might add a simplified validation here for user feedback)

        await apiService.createTrip(returnTripPayload);
        console.log('Return trip created successfully!'); // Consider translating this log message too

        // Notify parent component that a trip (the new return trip) was saved
        emits('tripSaved');

        // Close the current modal after creating the return trip
        // The parent component should then refresh the trip list
        handleClose();

    } catch (error) {
        console.error('Error creating return trip:', error.response?.data || error.message); // Consider translating this log message too
        mapApiError.value = error.response?.data?.message || i18n.global.t('trips.errorCreatingReturnTrip');
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
    <div v-if="show" class="modal-backdrop fade show"></div>

    <div class="modal fade" :class="{ 'show d-block': show }" tabindex="-1" role="dialog" aria-hidden="true" @click.self="handleClose">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ tripForm.id ? $t('trips.editTrip') : $t('trips.createTrip') }}</h5>
                    <button type="button" class="close" @click="handleClose" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div v-if="formErrors.api" class="alert alert-danger" role="alert">
                        {{ formErrors.api }}
                    </div>
                    <form @submit.prevent="handleSubmit">
                        <div class="form-group">
                            <label for="tripDate">{{ $t('trips.date') }}</label>
                            <input type="date" class="form-control" :class="{ 'is-invalid': formErrors.date }" id="tripDate" v-model="tripForm.date">
                            <div class="invalid-feedback" v-if="formErrors.date">{{ formErrors.date }}</div>
                        </div>
                        <div class="form-group">
                            <label for="startLocation">{{ $t('trips.from') }}</label>
                            <select class="form-control" :class="{ 'is-invalid': formErrors.start_location_id }" id="startLocation" v-model="tripForm.start_location_id">
                                <option :value="null" disabled>{{ $t('common.selectLocation') }}</option>
                                <option v-for="location in locations" :key="location.id" :value="location.id">{{ location.name }}</option>
                            </select>
                            <div class="invalid-feedback" v-if="formErrors.start_location_id">{{ formErrors.start_location_id }}</div>
                        </div>
                        <div class="form-group">
                            <label for="endLocation">{{ $t('trips.to') }}</label>
                            <select class="form-control" :class="{ 'is-invalid': formErrors.end_location_id }" id="endLocation" v-model="tripForm.end_location_id">
                                <option :value="null" disabled>{{ $t('common.selectLocation') }}</option>
                                <option v-for="location in locations" :key="location.id" :value="location.id">{{ location.name }}</option>
                            </select>
                            <div class="invalid-feedback" v-if="formErrors.end_location_id">{{ formErrors.end_location_id }}</div>
                        </div>
                        <div class="form-group">
                            <label for="purpose">{{ $t('trips.purpose') }}</label>
                            <input type="text" class="form-control" :class="{ 'is-invalid': formErrors.purpose }" id="purpose" v-model="tripForm.purpose">
                            <div class="invalid-feedback" v-if="formErrors.purpose">{{ formErrors.purpose }}</div>
                        </div>
                        
                        <div class="form-group">
                            <label>{{ $t('trips.routeVisualization') }}</label>
                            <div id="tripMap" style="height: 300px; width: 100%; border: 1px solid #ddd; margin-bottom: 10px;"></div>
                            <div v-if="mapApiError" class="alert alert-warning" role="alert">
                                {{ mapApiError }}
                            </div>
                            <div v-if="mapCalculatedDistance !== null" class="d-flex justify-content-between align-items-center">
                                <strong>{{ $t('trips.calculatedDistance') }} {{ mapCalculatedDistance }} km</strong>
                                <button type="button" class="btn btn-sm btn-info" @click="useMapDistance">{{ $t('trips.useThisDistance') }}</button>
                            </div>
                            <p v-else class="text-muted">{{ $t('trips.selectLocationsForRoute') }}</p>
                        </div>
                        
                        <div class="form-group">
                            <label for="distance">{{ $t('trips.distanceKm') }}</label>
                            <input type="number" step="0.1" class="form-control" :class="{ 'is-invalid': formErrors.distance_km }" id="distance" v-model="tripForm.distance_km">
                            <div class="invalid-feedback" v-if="formErrors.distance_km">{{ formErrors.distance_km }}</div>
                            <small class="form-text text-muted">{{ $t('trips.leaveEmptyForAuto') }}</small>
                        </div>
                        
                        <button type="button" class="btn btn-primary" @click="createReturnTrip" :disabled="isSubmitting || !tripForm.start_location_id || !tripForm.end_location_id" v-if="tripForm.id !== null">
                           {{ isSubmitting ? $t('trips.creatingReturn') : $t('trips.createReturn') }}
                        </button>

                        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                            {{ isSubmitting ? $t('common.saving') : (tripForm.id ? $t('trips.updateTrip') : $t('trips.createTrip')) }}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Basic modal styles for proper display if not fully relying on Bootstrap's JS for modals */
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1040;
}
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    outline: 0;
    z-index: 1050;
    display: none; /* Hidden by default, controlled by JS class */
}
.modal.show.d-block {
    display: block !important;
}
/* Adjustments for leaflet-routing-machine UI to fit better in modal if needed */
/* Example: Reduce font size of instructions */
.leaflet-routing-container {
    font-size: 0.9em; /* Adjust as needed */
}
/* IMPORTANT: LRM adds its control to the map, which typically floats.
   If it overlaps with your form, you might need to adjust its position
   or size in your CSS. Example: */
.leaflet-routing-container.leaflet-bar {
    width: 250px; /* Or a fixed width */
    max-height: 80%; /* Adjust if it's too tall */
    overflow-y: auto; /* Add scroll if content overflows */
}

/* You might want to hide the routing instructions panel if you only care about the map */
/* .leaflet-routing-container .leaflet-routing-alt {
    display: none;
} */
</style>
