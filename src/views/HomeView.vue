<template>
  <div class="home">
    <h1>{{ $t('dashboard.welcome') }}</h1>
    <p>{{ $t('dashboard.overviewSubtitle') }}</p>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'; // Import useI18n

const i18n = useI18n(); // Initialize useI18n
// No components or advanced logic needed here anymore
</script>

<style scoped>
.home {
  text-align: center;
  padding: 40px 20px;
}
h1 {
  color: #2c3e50;
  margin-bottom: 15px;
}
p {
  color: #555;
  font-size: 1.1em;
}
</style>
