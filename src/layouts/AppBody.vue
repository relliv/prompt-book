<template>
  <main class="body">
    <slot>
      <!-- Default welcome content when no slot content provided -->
      <div class="welcome">
        <div class="welcome-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h1 class="welcome-title">Welcome to Prompt Book</h1>
        <p class="welcome-description">
          Organize, manage, and access your AI prompts in one place. Select a project from the
          sidebar or create a new one to get started.
        </p>
        <div class="welcome-actions">
          <button class="primary-button" @click="handleGetStarted">
            <svg class="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Project
          </button>
        </div>
      </div>
    </slot>
  </main>
</template>

<script setup lang="ts">
const handleGetStarted = () => {
  // TODO: Implement create project functionality
  console.log('Create new project clicked');
};
</script>

<style scoped>
@reference 'tailwindcss';

.body {
  @apply flex-1 overflow-y-auto bg-(--bg-primary) p-4;

  .welcome {
    @apply flex flex-col items-center justify-center h-full text-center px-8 py-12;

    .welcome-icon {
      @apply w-20 h-20 mb-6 text-(--text-tertiary);

      svg {
        @apply w-full h-full;
      }
    }

    .welcome-title {
      @apply text-3xl font-bold mb-4 text-(--text-primary);
    }

    .welcome-description {
      @apply text-base max-w-md mb-8 text-(--text-secondary) leading-relaxed;
    }

    .welcome-actions {
      @apply flex gap-4;

      .primary-button {
        @apply inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white cursor-pointer border-none transition-colors duration-200 bg-(--accent-color);

        &:hover {
          @apply bg-(--accent-hover);
        }

        .button-icon {
          @apply w-5 h-5;
        }
      }
    }
  }
}
</style>
