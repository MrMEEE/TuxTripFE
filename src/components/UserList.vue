<template>
  <div class="card shadow mb-4">
    <div class="card-header py-3 d-flex justify-content-between align-items-center">
        <h6 class="m-0 font-weight-bold text-primary">Existing Users</h6>
        <button class="btn btn-success btn-sm" @click="openCreateModal">
            <i class="fas fa-plus"></i> Create New User
        </button>
    </div>
    <div class="card-body">
      <div v-if="apiMessage" :class="['alert', apiMessageType === 'success' ? 'alert-success' : 'alert-danger']">
        {{ apiMessage }}
      </div>
      <div v-if="!users.length && apiMessageType !== 'info'" class="text-center text-muted">No users found.</div>
      <div v-else class="table-responsive">
          <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
              <thead>
                  <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Admin</th>
                      <th>Actions</th>
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
                          <button @click="openEditModal(user)" class="btn btn-sm btn-info me-2">Edit</button>
                          <button @click="deleteUser(user.id)" class="btn btn-sm btn-danger" :disabled="user.id === currentUserId">Delete</button>
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
            apiMessage.value = 'Fetched no users from the database.';
            apiMessageType.value = 'info';
        } else {
            apiMessage.value = `Fetched ${users.value.length} users.`;
            apiMessageType.value = 'success';
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        apiMessage.value = `Error loading users: ${error.response?.data?.message || error.message}`;
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
            apiMessage.value = 'User updated!';
        } else {
            await apiService.createUser(formData);
            apiMessage.value = 'User created!';
        }
        apiMessageType.value = 'success';
        showModal.value = false;
        fetchUsers();
    } catch (error) {
        apiMessage.value = error.response?.data?.message || 'Error saving user.';
        apiMessageType.value = 'danger';
        console.error('Error:', error);
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
        apiMessage.value = `User ID ${userId} admin status updated.`;
        apiMessageType.value = 'success';
    } catch (error) {
        apiMessage.value = `Error updating admin status for user ID ${userId}: ${error.response?.data?.message || error.message}`;
        apiMessageType.value = 'danger';
        fetchUsers();
        console.error('Error updating admin status:', error);
    }
};

const deleteUser = async (userId) => {
    if (userId === currentUserId.value) {
        Swal.fire({
            title: 'Error!',
            text: 'You cannot delete your own administrator user.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
        try {
            const response = await apiService.deleteUser(userId);
            Swal.fire(
                'Deleted!',
                'The user has been deleted.',
                'success'
            );
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            Swal.fire(
                'Error!',
                error.response?.data?.message || 'Could not delete the user. Please try again.',
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