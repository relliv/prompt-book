<template>
  <DefaultLayout>
    <router-view />
  </DefaultLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import DefaultLayout from './layouts/DefaultLayout.vue';

const THEME_KEY = 'preferred-theme';

const initTheme = () => {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
};

onMounted(() => {
  initTheme();
});
</script>
