<template>
  <header class="navbar">
    <div ref="searchContainerRef" class="search-container">
      <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        ref="searchInputRef"
        v-model="searchQuery"
        type="text"
        class="search-input"
        :class="{ 'has-clear': hasQuery }"
        placeholder="Search prompts..."
        @input="handleSearchInput"
        @focus="openDropdown"
        @keydown.escape="closeDropdown"
      />
      <button
        v-if="hasQuery"
        class="clear-button"
        aria-label="Clear search"
        @click="clearSearch"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div v-if="isDropdownOpen" class="search-dropdown">
        <div v-if="isLoading" class="dropdown-loading">
          <span>Searching...</span>
        </div>
        <div v-else-if="searchResults.length === 0" class="dropdown-empty">
          <span v-if="hasQuery">No prompts found</span>
          <span v-else>No recent prompts</span>
        </div>
        <div v-else class="dropdown-results">
          <div class="dropdown-header">
            <span v-if="hasQuery">Search Results</span>
            <span v-else>Recent Prompts</span>
          </div>
          <button
            v-for="prompt in searchResults"
            :key="prompt.id"
            class="dropdown-item"
            @click="navigateToPrompt(prompt)"
          >
            <div class="prompt-info">
              <span class="prompt-title">{{ prompt.title }}</span>
              <span class="prompt-meta">
                <span class="project-icon">{{ prompt.projectIcon }}</span>
                <span class="project-name">{{ prompt.projectName }}</span>
                <span class="separator">/</span>
                <span class="feature-name">{{ prompt.featureName }}</span>
              </span>
            </div>
          </button>
        </div>
      </div>
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
import { ref, onMounted, onUnmounted } from 'vue';
import { useSearch } from '@app/composables/useSearch';

const {
  searchQuery,
  searchResults,
  isDropdownOpen,
  isLoading,
  hasQuery,
  handleSearchInput,
  openDropdown,
  closeDropdown,
  clearSearch,
  navigateToPrompt,
} = useSearch();

const searchContainerRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);

const handleClickOutside = (event: MouseEvent) => {
  if (
    searchContainerRef.value &&
    !searchContainerRef.value.contains(event.target as Node)
  ) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const handleSettings = () => {
  // TODO: Implement settings panel
  console.log('Settings clicked');
};
</script>

<style scoped>
@reference 'tailwindcss';

.navbar {
  @apply flex items-center justify-between px-6 py-3 border-b border-(--border-color) bg-(--header-bg);

  .search-container {
    @apply relative flex items-center flex-1 max-w-md;

    .search-icon {
      @apply absolute left-3 w-5 h-5 text-(--text-tertiary) pointer-events-none z-10;
    }

    .search-input {
      @apply w-full pl-10 pr-4 py-2 rounded-lg border border-(--border-color) bg-(--bg-primary) text-(--text-primary) text-sm transition-all duration-200;

      &.has-clear {
        @apply pr-10;
      }

      &::placeholder {
        @apply text-(--text-tertiary);
      }

      &:focus {
        @apply outline-none border-(--accent-color) ring-2 ring-(--accent-color)/20;
      }
    }

    .clear-button {
      @apply absolute right-3 flex items-center justify-center w-5 h-5 rounded-full bg-transparent border-none cursor-pointer text-(--text-tertiary) transition-colors duration-200 z-10;

      &:hover {
        @apply text-(--text-primary) bg-(--bg-tertiary);
      }

      svg {
        @apply w-4 h-4;
      }
    }

    .search-dropdown {
      @apply absolute top-full left-0 right-0 mt-2 rounded-lg border border-(--border-color) bg-(--bg-secondary) shadow-lg z-50 max-h-80 overflow-auto;

      animation: dropdown-show 150ms cubic-bezier(0.16, 1, 0.3, 1);

      .dropdown-loading,
      .dropdown-empty {
        @apply flex items-center justify-center py-6 text-sm text-(--text-tertiary);
      }

      .dropdown-header {
        @apply px-3 py-2 text-xs font-semibold uppercase tracking-wider text-(--text-tertiary) border-b border-(--border-color);
      }

      .dropdown-results {
        @apply py-1;
      }

      .dropdown-item {
        @apply w-full flex items-start gap-3 px-3 py-2.5 text-left bg-transparent border-none cursor-pointer transition-colors duration-150;

        &:hover {
          @apply bg-(--bg-tertiary);
        }

        .prompt-info {
          @apply flex flex-col gap-0.5 min-w-0;

          .prompt-title {
            @apply text-sm font-medium text-(--text-primary) truncate;
          }

          .prompt-meta {
            @apply flex items-center gap-1 text-xs text-(--text-tertiary);

            .project-icon {
              @apply text-sm;
            }

            .separator {
              @apply mx-0.5;
            }

            .feature-name {
              @apply truncate;
            }
          }
        }
      }
    }
  }

  .navbar-actions {
    @apply flex items-center gap-2;

    .action-button {
      @apply flex items-center justify-center w-10 h-10 rounded-lg bg-transparent border-none cursor-pointer text-(--text-secondary) transition-colors duration-200;

      &:hover {
        @apply bg-(--bg-tertiary) text-(--text-primary);
      }

      .icon {
        @apply w-5 h-5;
      }
    }
  }
}

@keyframes dropdown-show {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
