<template>
  <div class="layout">
    <AppSidebar />
    <div class="layout-main">
      <AppNavbar />
      <AppBody>
        <slot />
      </AppBody>
    </div>
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import AppSidebar from './AppSidebar.vue';
import AppNavbar from './AppNavbar.vue';
import AppBody from './AppBody.vue';
import ToastContainer from '@app/components/ToastContainer.vue';
</script>

<style scoped>
@reference 'tailwindcss';

.layout {
  @apply flex h-screen w-screen overflow-hidden;

  .layout-main {
    @apply flex flex-col flex-1 overflow-hidden;
  }
}
</style>
