<template>
  <div class="card shadow mb-4">
    <div class="card-header py-3 d-flex justify-content-between align-items-center">
        <h6 class="m-0 font-weight-bold text-primary">Eksisterende brugere</h6>
        <button class="btn btn-success btn-sm" @click="openCreateModal">
            <i class="fas fa-plus"></i> Opret Ny Bruger
        </button>
    </div>
    <div class="card-body">
      <div v-if="apiMessage" :class="['alert', apiMessageType === 'success' ? 'alert-success' : 'alert-danger']">
        {{ apiMessage }}
      </div>
      <div v-if="!users.length && apiMessageType !== 'info'" class="text-center text-muted">Ingen brugere fundet.</div>
      <div v-else class="table-responsive">
          <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
              <thead>
                  <tr>
                      <th>ID</th>
                      <th>Brugernavn</th>
                      <th>Admin</th>
                      <th>Handlinger</th>
                  </tr>
              </thead>
              <tbody>
                  <tr v-for="user in users" :key="user.id">
                      <td>{{ user.id }}</td>
                      <td>{{ user.username }}</td>
                      <td>
                          <input type="checkbox" :checked="user.is_admin" @change="toggleAdminStatus(user.id, $event.target.checked)">
                      </td>
                      <td>
                          <button @click="openEditModal(user)" class="btn btn-sm btn-info me-2">Rediger</button>
                          <button @click="deleteUser(user.id)" class="btn btn-sm btn-danger" :disabled="user.id === currentUserId">Slet</button>
                      </td>
                  </tr>
              </tbody>
          </table>
      </div>
    </div>
  </div>
  
  <UserFormModal 
      :show="showModal" 
      :userToEdit="userToEdit" 
      @user-saved="handleUserSaved"
      @close="showModal = false"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { apiService } from '@/services/apiService';
import { useAuthStore } from '@/stores/authStore';
import UserFormModal from '@/components/UserFormModal.vue';
import Swal from 'sweetalert2';

const users = ref([]);
const apiMessage = ref('');
const apiMessageType = ref('');
const authStore = useAuthStore();
const currentUserId = ref(null);

// Modal state
const showModal = ref(false);
const userToEdit = ref(null);
const isSubmitting = ref(false);

const fetchUsers = async () => {
    apiMessage.value = '';
    apiMessageType.value = '';
    try {
        const data = await apiService.getUsers();
        users.value = data;
        if (users.value.length === 0) {
            apiMessage.value = 'Hentede ingen brugere fra databasen.';
            apiMessageType.value = 'info';
        } else {
            apiMessage.value = `Hentede ${users.value.length} brugere.`;
            apiMessageType.value = 'success';
        }
    } catch (error) {
        console.error('Fejl ved hentning af brugere:', error);
        apiMessage.value = `Fejl ved indlæsning af brugere: ${error.response?.data?.message || error.message}`;
        apiMessageType.value = 'danger';
    }
};

const handleUserSaved = async (formData) => {
    isSubmitting.value = true;
    apiMessage.value = '';
    apiMessageType.value = '';

    try {
        if (formData.id) {
            await apiService.updateUser(formData.id, formData);
            apiMessage.value = 'Bruger opdateret!';
        } else {
            await apiService.createUser(formData);
            apiMessage.value = 'Bruger oprettet!';
        }
        apiMessageType.value = 'success';
        showModal.value = false;
        fetchUsers();
    } catch (error) {
        apiMessage.value = error.response?.data?.message || 'Fejl ved lagring af bruger.';
        apiMessageType.value = 'danger';
        console.error('Fejl:', error);
    } finally {
        isSubmitting.value = false;
    }
};

const openCreateModal = () => {
    userToEdit.value = null;
    showModal.value = true;
};

const openEditModal = (user) => {
    userToEdit.value = user;
    showModal.value = true;
};

const toggleAdminStatus = async (userId, isAdmin) => {
    try {
        await apiService.updateUser(userId, { is_admin: isAdmin });
        apiMessage.value = `Bruger ID ${userId} admin status opdateret.`;
        apiMessageType.value = 'success';
    } catch (error) {
        apiMessage.value = `Fejl ved opdatering af admin status for bruger ID ${userId}: ${error.response?.data?.message || error.message}`;
        apiMessageType.value = 'danger';
        fetchUsers();
        console.error('Fejl ved opdatering af admin status:', error);
    }
};

const deleteUser = async (userId) => {
    if (userId === currentUserId.value) {
        Swal.fire({
            title: 'Fejl!',
            text: 'Du kan ikke slette din egen administratorbruger.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    const result = await Swal.fire({
        title: 'Er du sikker?',
        text: 'Du kan ikke fortryde dette!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ja, slet den!',
        cancelButtonText: 'Annuller'
    });

    if (result.isConfirmed) {
        try {
            const response = await apiService.deleteUser(userId);
            Swal.fire(
                'Slettet!',
                'Brugeren er blevet slettet.',
                'success'
            );
            fetchUsers();
        } catch (error) {
            console.error('Fejl ved sletning af bruger:', error);
            Swal.fire(
                'Fejl!',
                error.response?.data?.message || 'Kunne ikke slette brugeren. Prøv igen.',
                'error'
            );
        }
    }
};

onMounted(() => {
  fetchUsers();
  currentUserId.value = authStore.user?.id;
});
</script>

<style scoped>
.table-responsive {
    margin-top: 20px;
}
</style>