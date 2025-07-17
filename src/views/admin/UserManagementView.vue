<template>
  <div class="admin-users-page">
    <h2>Brugeradministration</h2>
    <p class="mb-4">Her kan du se, oprette, redigere og slette brugere.</p>

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