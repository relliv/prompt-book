<template>
  <header class="navbar">
    <div class="search-container">
      <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="Search prompts..."
        @input="handleSearch"
      />
    </div>

    <div class="navbar-actions">
      <button class="action-button" aria-label="Settings" @click="handleSettings">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const searchQuery = ref('');

const handleSearch = () => {
  // TODO: Implement search functionality
  console.log('Searching for:', searchQuery.value);
};

const handleSettings = () => {
  // TODO: Implement settings panel
  console.log('Settings clicked');
};
</script>

<style scoped>
@reference 'tailwindcss';

.navbar {
  @apply flex items-center justify-between px-6 py-3 border-b border-(--border-color) bg-(--header-bg);
}

.search-container {
  @apply relative flex items-center flex-1 max-w-md;
}

.search-icon {
  @apply absolute left-3 w-5 h-5 text-(--text-tertiary) pointer-events-none;
}

.search-input {
  @apply w-full pl-10 pr-4 py-2 rounded-lg border border-(--border-color) bg-(--bg-primary) text-(--text-primary) text-sm transition-all duration-200;

  &::placeholder {
    @apply text-(--text-tertiary);
  }

  &:focus {
    @apply outline-none border-(--accent-color) ring-2 ring-(--accent-color)/20;
  }
}

.navbar-actions {
  @apply flex items-center gap-2;
}

.action-button {
  @apply flex items-center justify-center w-10 h-10 rounded-lg bg-transparent border-none cursor-pointer text-(--text-secondary) transition-colors duration-200;

  &:hover {
    @apply bg-(--bg-tertiary) text-(--text-primary);
  }

  .icon {
    @apply w-5 h-5;
  }
}
</style>
