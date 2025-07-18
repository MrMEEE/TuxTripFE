<template>
  <div class="admin-users-page">
    <h2>{{ $t('userAdmin.title') }}</h2>
    <p class="mb-4">{{ $t('userAdmin.subtitle') }}</p>

    <UserList />

  </div>
</template>

<script setup>
import UserList from '@/components/UserList.vue';
import { useI18n } from 'vue-i18n'; // Import useI18n

const i18n = useI18n(); // Initialize useI18n
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
