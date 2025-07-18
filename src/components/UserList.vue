<template>
  <div class="card shadow mb-4">
    <div class="card-header py-3 d-flex justify-content-between align-items-center">
        <h6 class="m-0 font-weight-bold text-primary">{{ $t('userAdmin.existingUsers') }}</h6>
        <button class="btn btn-success btn-sm" @click="openCreateModal">
            <i class="fas fa-plus"></i> {{ $t('userAdmin.createNewUser') }}
        </button>
    </div>
    <div class="card-body">
      <div v-if="apiMessage" :class="['alert', apiMessageType === 'success' ? 'alert-success' : 'alert-danger']">
        {{ apiMessage }}
      </div>
      <div v-if="!users.length && apiMessageType !== 'info'" class="text-center text-muted">{{ $t('userAdmin.userNotFound') }}</div>
      <div v-else class="table-responsive">
          <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
              <thead>
                  <tr>
                      <th>ID</th>
                      <th>{{ $t('userAdmin.username') }}</th>
                      <th>{{ $t('userAdmin.admin') }}</th>
                      <th>{{ $t('userAdmin.actions') }}</th>
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
                          <button @click="openEditModal(user)" class="btn btn-sm btn-info me-2">
                            <i class="fas fa-edit"></i> {{ $t('common.edit') }}
                          </button>
                          <button @click="deleteUser(user.id)" class="btn btn-sm btn-danger" :disabled="user.id === currentUserId">
                            <i class="fas fa-trash"></i> {{ $t('common.delete') }}
                          </button>
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
import { useI18n } from 'vue-i18n'; // Import useI18n

const users = ref([]);
const apiMessage = ref('');
const apiMessageType = ref('');
const authStore = useAuthStore();
const currentUserId = ref(null);
const i18n = useI18n(); // Initialize useI18n

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
            apiMessage.value = i18n.global.t('userAdmin.userNotFound');
            apiMessageType.value = 'info';
        } else {
            // No explicit success message needed if users are found, as the table itself shows data.
            // Keeping apiMessage empty for success case to avoid redundant messages.
            apiMessage.value = ''; 
            apiMessageType.value = '';
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        apiMessage.value = i18n.global.t('common.error') + ': ' + (error.response?.data?.message || i18n.global.t('userAdmin.errorLoadingUsers'));
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
            apiMessage.value = i18n.global.t('userAdmin.userUpdated');
        } else {
            await apiService.createUser(formData);
            apiMessage.value = i18n.global.t('userAdmin.userCreated');
        }
        apiMessageType.value = 'success';
        showModal.value = false;
        fetchUsers();
    } catch (error) {
        apiMessage.value = error.response?.data?.message || i18n.global.t('userAdmin.errorSavingUser');
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
        apiMessage.value = i18n.global.t('userAdmin.userAdminStatusUpdated', { id: userId });
        apiMessageType.value = 'success';
    } catch (error) {
        apiMessage.value = i18n.global.t('userAdmin.errorUpdatingAdminStatus', { id: userId }) + ': ' + (error.response?.data?.message || error.message);
        apiMessageType.value = 'danger';
        fetchUsers(); // Re-fetch to revert checkbox if update failed
        console.error('Error updating admin status:', error);
    }
};

const deleteUser = async (userId) => {
    if (userId === currentUserId.value) {
        Swal.fire({
            title: i18n.global.t('common.error'),
            text: i18n.global.t('userAdmin.cannotDeleteOwnAdmin'),
            icon: 'error',
            confirmButtonText: i18n.global.t('common.confirm')
        });
        return;
    }
    
    const result = await Swal.fire({
        title: i18n.global.t('common.areYouSure'),
        text: i18n.global.t('common.cannotRevert'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: i18n.global.t('common.yesDeleteIt'),
        cancelButtonText: i18n.global.t('common.cancel')
    });

    if (result.isConfirmed) {
        try {
            const response = await apiService.deleteUser(userId);
            Swal.fire(
                i18n.global.t('common.deleted'),
                i18n.global.t('userAdmin.userDeleted'),
                'success'
            );
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            Swal.fire(
                i18n.global.t('common.error'),
                error.response?.data?.message || i18n.global.t('userAdmin.couldNotDeleteUser'),
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
