<template>
  <div class="admin-users-page">
    <h2>Brugeradministration</h2>

    <div class="card shadow mb-4">
      <div class="card-header py-3">
        <h6 class="m-0 font-weight-bold text-primary">Opret ny bruger</h6>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleCreateUser">
          <div class="form-group">
            <input type="text" class="form-control mb-2" v-model="newUserData.username" placeholder="Brugernavn" required />
          </div>
          <div class="form-group row">
            <div class="col-sm-6 mb-2 mb-sm-0">
              <input type="password" class="form-control" v-model="newUserData.password" placeholder="Password" required />
            </div>
            <div class="col-sm-6">
              <input type="password" class="form-control" v-model="newUserData.confirmPassword" placeholder="Gentag Password" required />
            </div>
          </div>
          <div class="form-group form-check mt-2 mb-3">
            <input type="checkbox" class="form-check-input" id="isAdminCheckbox" v-model="newUserData.isAdmin">
            <label class="form-check-label" for="isAdminCheckbox">Administrator?</label>
          </div>
          <button type="submit" class="btn btn-primary btn-block">Opret Bruger</button>
        </form>
        <div v-if="createUserMessage" :class="['alert mt-3', createUserMessageType === 'success' ? 'alert-success' : 'alert-danger']">
          {{ createUserMessage }}
        </div>
      </div>
    </div>

    <div class="card shadow mb-4 mt-5">
      <div class="card-header py-3">
        <h6 class="m-0 font-weight-bold text-primary">Eksisterende brugere</h6>
      </div>
      <div class="card-body">
        <div v-if="usersMessage" :class="['alert', usersMessageType === 'success' ? 'alert-success' : (usersMessageType === 'error' ? 'alert-danger' : 'alert-info')]">
          {{ usersMessage }}
        </div>
        <div v-if="users.length === 0 && !usersMessage" class="text-center text-muted">Ingen brugere fundet.</div>
        <div class="table-responsive">
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
                            <button @click="resetUserPassword(user.id)" class="btn btn-sm btn-info mr-2">Nulstil Pass</button>
                            <button @click="deleteUser(user.id)" class="btn btn-sm btn-danger" :disabled="user.id === currentUserId">Slet</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { apiService } from '@/services/apiService';

const newUserData = ref({
  username: '',
  password: '',
  confirmPassword: '',
  isAdmin: false
});
const createUserMessage = ref('');
const createUserMessageType = ref('');

const users = ref([]);
const usersMessage = ref('');
const usersMessageType = ref('');

const currentUserId = ref(null); // To store the ID of the currently logged-in user

const fetchUsers = async () => {
  usersMessage.value = '';
  usersMessageType.value = '';
  try {
    const data = await apiService.adminGetUsers();
    users.value = data;
    if (users.value.length === 0) {
      usersMessage.value = 'Hentede ingen brugere fra databasen.';
      usersMessageType.value = 'info';
    } else {
      usersMessage.value = `Hentede ${users.value.length} brugere.`;
      usersMessageType.value = 'success';
    }
  } catch (error) {
    console.error('Fejl ved hentning af brugere:', error);
    usersMessage.value = `Fejl ved indlæsning af brugere: ${error.message}`;
    usersMessageType.value = 'danger';
  }
};

const handleCreateUser = async () => {
  createUserMessage.value = '';
  createUserMessageType.value = '';

  if (newUserData.value.password !== newUserData.value.confirmPassword) {
    createUserMessage.value = 'Passwords matcher ikke.';
    createUserMessageType.value = 'danger';
    return;
  }

  try {
    const response = await apiService.adminCreateUser(
      newUserData.value.username,
      newUserData.value.password,
      newUserData.value.isAdmin
    );
    createUserMessage.value = response.message;
    createUserMessageType.value = 'success';
    // Clear form
    newUserData.value = {
      username: '',
      password: '',
      confirmPassword: '',
      isAdmin: false
    };
    fetchUsers(); // Refresh the user list
  } catch (error) {
    createUserMessage.value = error.message || 'Fejl ved oprettelse af bruger.';
    createUserMessageType.value = 'danger';
    console.error('Fejl ved oprettelse af bruger:', error);
  }
};

const toggleAdminStatus = async (userId, isAdmin) => {
    try {
        await apiService.adminUpdateUser(userId, { is_admin: isAdmin });
        usersMessage.value = `Bruger ID ${userId} admin status opdateret.`;
        usersMessageType.value = 'success';
    } catch (error) {
        usersMessage.value = `Fejl ved opdatering af admin status for bruger ID ${userId}: ${error.message}`;
        usersMessageType.value = 'danger';
        // Re-fetch users to revert checkbox if update failed
        fetchUsers();
        console.error('Fejl ved opdatering af admin status:', error);
    }
};

const resetUserPassword = async (userId) => {
    const newPass = prompt("Indtast nyt password for brugeren:");
    if (newPass) {
        try {
            await apiService.adminUpdateUser(userId, { password: newPass });
            usersMessage.value = `Password for bruger ID ${userId} nulstillet.`;
            usersMessageType.value = 'success';
        } catch (error) {
            usersMessage.value = `Fejl ved nulstilling af password for bruger ID ${userId}: ${error.message}`;
            usersMessageType.value = 'danger';
            console.error('Fejl ved nulstilling af password:', error);
        }
    }
};

const deleteUser = async (userId) => {
    if (userId === currentUserId.value) {
        alert("Du kan ikke slette din egen administratorbruger.");
        return;
    }
    if (confirm(`Er du sikker på, at du vil slette bruger ID ${userId} og alle tilknyttede lokationer og ture?`)) {
        try {
            const response = await apiService.adminDeleteUser(userId);
            usersMessage.value = response.message;
            usersMessageType.value = 'success';
            fetchUsers(); // Refresh list after deletion
        } catch (error) {
            usersMessage.value = `Fejl ved sletning af bruger ID ${userId}: ${error.message}`;
            usersMessageType.value = 'danger';
            console.error('Fejl ved sletning af bruger:', error);
        }
    }
};

onMounted(() => {
  fetchUsers();
  // Get current user's ID for disabling self-deletion
  // This requires another API endpoint or parsing JWT on client, for now assume
  // that `get_jwt_identity()` in backend (which we already have) is sufficient
  // to prevent admin from deleting themselves.
  // For frontend logic, we can get username from local storage and derive ID from there,
  // or add a new endpoint on backend to fetch current user's ID.
  // For simplicity, let's just make the backend handle the self-deletion check.
  // However, disabling the button on frontend is good UX.
  // For now, we'll keep `currentUserId` as null, and rely on backend validation.
  // A better solution would be to add a /api/me endpoint or parse the JWT locally.
  const token = localStorage.getItem('jwt_token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      currentUserId.value = payload.sub; // 'sub' is the identity from Flask-JWT-Extended
    } catch (e) {
      console.error("Could not parse JWT token:", e);
    }
  }
});
</script>

<style scoped>
/* Specific styles for this page, mostly leveraging SB Admin 2 classes */
.admin-users-page {
  padding: 0 20px;
}
h2 {
  color: #2c3e50;
  text-align: center;
  margin-top: 20px;
  margin-bottom: 30px;
}
.table-responsive {
    margin-top: 20px;
}
</style>