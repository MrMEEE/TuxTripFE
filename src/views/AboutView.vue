<template>
  <div class="about">
    <h1>{{ $t('about.title') }}</h1>
    <p>{{ $t('about.description') }}</p>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'; // Import useI18n

const i18n = useI18n(); // Initialize useI18n
</script>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
