<template>
  <div class="home">
    <div class="welcome">
      <h1>Welcome to Prompt Book</h1>
      <p>Select a project from the sidebar or create a new one to get started.</p>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
@reference 'tailwindcss';

.home {
  @apply flex items-center justify-center h-full;

  .welcome {
    @apply text-center;

    h1 {
      @apply text-2xl font-bold mb-2 text-(--text-primary);
    }

    p {
      @apply text-(--text-secondary);
    }
  }
}
</style>
