<template>
  <div class="card shadow mb-4"> <div class="card-header py-3">
      <h6 class="m-0 font-weight-bold text-primary">Adresseopslag & Lokationer</h6>
    </div>
    <div class="card-body">
      <h4 class="h5 mb-3 text-gray-800">1. Slå adresse op</h4>
      <div class="form-group row"> <div class="col-sm-10 mb-3 mb-sm-0">
          <input
            type="text"
            class="form-control form-control-user" v-model="addressQuery"
            placeholder="Søg adresse (f.eks. Rådhuspladsen 1, Kbh)"
            @keyup.enter="handleAddressLookup"
          />
        </div>
        <div class="col-sm-2">
          <button @click="handleAddressLookup" class="btn btn-primary btn-user btn-block"> Slå op
          </button>
        </div>
      </div>
      <div v-if="lookupMessage" :class="['alert', lookupMessageType === 'success' ? 'alert-success' : 'alert-danger']">
        {{ lookupMessage }}
      </div>
      <div v-if="lookupResults" class="mb-4 p-3 bg-light border rounded"> <strong>Adresse:</strong> {{ lookupResults.display_name }}<br />
        <strong>Latitude:</strong> {{ lookupResults.latitude.toFixed(6) }}<br />
        <strong>Longitude:</strong> {{ lookupResults.longitude.toFixed(6) }}
      </div>

      <hr> <h4 class="h5 mb-3 text-gray-800">2. Opret ny lokation</h4>
      <div class="form-group">
        <input type="text" class="form-control mb-2" v-model="newLocation.name" placeholder="Lokationsnavn (påkrævet)" />
        <input
          type="text"
          class="form-control mb-2"
          v-model="newLocation.address"
          placeholder="Adresse (valgfri, udfyldes automatisk ved opslag)"
        />
        <div class="row">
          <div class="col-sm-6 mb-2 mb-sm-0">
            <input
              type="text"
              class="form-control"
              v-model="newLocation.latitude"
              placeholder="Latitude (valgfri, udfyldes ved opslag)"
              readonly
            />
          </div>
          <div class="col-sm-6">
            <input
              type="text"
              class="form-control"
              v-model="newLocation.longitude"
              placeholder="Longitude (valgfri, udfyldes ved opslag)"
              readonly
            />
          </div>
        </div>
        <input type="text" class="form-control mt-2 mb-3" v-model="newLocation.description" placeholder="Beskrivelse (valgfri)" />
        <button @click="handleCreateLocation" class="btn btn-success btn-block">Opret Lokation</button>
      </div>
      <div v-if="createLocationMessage" :class="['alert', createLocationMessageType === 'success' ? 'alert-success' : 'alert-danger']">
        {{ createLocationMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { apiService } from '@/services/apiService';

const addressQuery = ref('');
const lookupResults = ref(null);
const lookupMessage = ref('');
const lookupMessageType = ref('');

const newLocation = ref({
  name: '',
  address: '',
  latitude: '',
  longitude: '',
  description: ''
});
const createLocationMessage = ref('');
const createLocationMessageType = ref('');

const emit = defineEmits(['locationCreated']);

const handleAddressLookup = async () => {
  lookupMessage.value = '';
  lookupMessageType.value = '';
  lookupResults.value = null;

  if (!addressQuery.value.trim()) {
    lookupMessage.value = 'Indtast en adresse for at søge.';
    lookupMessageType.value = 'danger'; // Bootstrap alert-danger
    return;
  }

  try {
    lookupMessage.value = 'Søger...';
    lookupMessageType.value = '';
    const data = await apiService.lookupAddress(addressQuery.value.trim());

    if (data.latitude && data.longitude) {
      lookupResults.value = data;
      newLocation.value.address = data.display_name;
      newLocation.value.latitude = data.latitude;
      newLocation.value.longitude = data.longitude;
      lookupMessage.value = 'Adresse fundet. Du kan nu oprette lokationen herunder.';
      lookupMessageType.value = 'success'; // Bootstrap alert-success
    } else {
      lookupMessage.value = data.message || 'Ingen resultater fundet for adressen.';
      lookupMessageType.value = 'danger';
    }
  } catch (error) {
    console.error('Adresseopslag fejl:', error);
    lookupMessage.value = `Fejl: ${error.message}`;
    lookupMessageType.value = 'danger';
  }
};

const handleCreateLocation = async () => {
  createLocationMessage.value = '';
  createLocationMessageType.value = '';

  const { name, address, latitude, longitude, description } = newLocation.value;

  if (!name.trim()) {
    createLocationMessage.value = 'Lokationsnavn er påkrævet for at oprette en lokation.';
    createLocationMessageType.value = 'danger';
    return;
  }
  if (!latitude || !longitude || isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
    createLocationMessage.value = 'Latitude og Longitude skal være gyldige tal (opslå eller indtast manuelt).';
    createLocationMessageType.value = 'danger';
    return;
  }

  const locationData = {
    name: name.trim(),
    address: address.trim() || null,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    description: description.trim() || null
  };

  try {
    createLocationMessage.value = 'Opretter lokation...';
    createLocationMessageType.value = '';
    const result = await apiService.createLocation(locationData);
    createLocationMessage.value = result.message;
    createLocationMessageType.value = 'success';

    newLocation.value = { name: '', address: '', latitude: '', longitude: '', description: '' };
    addressQuery.value = '';
    lookupResults.value = null;
    lookupMessage.value = '';
    lookupMessageType.value = '';

    emit('locationCreated');
  } catch (error) {
    console.error('Fejl ved oprettelse af lokation:', error);
    createLocationMessage.value = `Fejl: ${error.message}`;
    createLocationMessageType.value = 'danger';
  }
};

watch(addressQuery, (newVal) => {
  if (!newVal.trim()) {
    lookupResults.value = null;
    lookupMessage.value = '';
    lookupMessageType.value = '';
    newLocation.value.address = '';
    newLocation.value.latitude = '';
    newLocation.value.longitude = '';
  }
});
</script>
<style scoped>
/* You can keep very minimal, high-level overrides here if truly necessary */
</style>