<template>
  <div class="admin-users-page">
    <h2>User Administration</h2>
    <p class="mb-4">Here you can view, create, edit, and delete users.</p>

    <UserList />

  </div>
</template>

<script setup>
import UserList from '@/components/UserList.vue';
</script>

<style scoped>
.admin-users-page {
  padding: 0 20px;
}
h2 {
  color: #2c3e50;
  text-align: center;
  margin-top: 20px;
  margin-bottom: 30px;
}
</style>