<template>
  <div class="prompts-page">
    <header class="page-header">
      <div class="project-info">
        <span class="project-icon">{{ selectedProject?.icon }}</span>
        <h1 class="project-name">{{ selectedProject?.name }}</h1>
      </div>
      <div class="header-actions">
        <span class="prompt-count">{{ promptCount }} prompts</span>
      </div>
    </header>

    <div class="content">
      <div v-if="isLoading" class="loading">Loading prompts...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="prompts.length === 0" class="empty">
        <p>No prompts yet. Create your first prompt to get started.</p>
      </div>
      <table v-else class="prompts-table">
        <thead>
          <tr>
            <th class="col-prompt">Prompt</th>
            <th class="col-copies">Copies</th>
            <th class="col-created">Created</th>
            <th class="col-updated">Updated</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prompt in prompts" :key="prompt.id">
            <td class="col-prompt">
              <div class="prompt-text">{{ prompt.prompt }}</div>
            </td>
            <td class="col-copies">{{ prompt.copyCount }}</td>
            <td class="col-created">{{ formatDate(prompt.createdAt) }}</td>
            <td class="col-updated">{{ formatDate(prompt.updatedAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useProjectsStore, usePromptsStore } from '@app/shared/stores';

const route = useRoute();
const projectsStore = useProjectsStore();
const promptsStore = usePromptsStore();

const { selectedProject } = storeToRefs(projectsStore);
const { prompts, promptCount, isLoading, error } = storeToRefs(promptsStore);

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const loadPrompts = async (projectId: number) => {
  await projectsStore.selectProject(projectId);
  await promptsStore.fetchPrompts(projectId);
};

onMounted(() => {
  const projectId = Number(route.params.id);
  if (projectId) {
    loadPrompts(projectId);
  }
});

watch(
  () => route.params.id,
  newId => {
    if (newId) {
      loadPrompts(Number(newId));
    }
  }
);
</script>

<style scoped>
@reference 'tailwindcss';

.prompts-page {
  @apply flex flex-col h-full;

  .page-header {
    @apply flex items-center justify-between px-6 py-4 border-b border-(--border-color);

    .project-info {
      @apply flex items-center gap-3;

      .project-icon {
        @apply text-2xl;
      }

      .project-name {
        @apply text-xl font-semibold text-(--text-primary) m-0;
      }
    }

    .header-actions {
      @apply flex items-center gap-4;

      .prompt-count {
        @apply text-sm text-(--text-secondary);
      }
    }
  }

  .content {
    @apply flex-1 overflow-auto p-6;

    .loading,
    .error,
    .empty {
      @apply flex items-center justify-center h-full text-(--text-secondary);
    }

    .error {
      @apply text-red-500;
    }
  }

  .prompts-table {
    @apply w-full border-collapse;

    th,
    td {
      @apply px-4 py-3 text-left border-b border-(--border-color);
    }

    th {
      @apply text-xs font-semibold uppercase tracking-wider text-(--text-tertiary) bg-(--bg-secondary);
    }

    td {
      @apply text-sm text-(--text-primary);
    }

    tbody tr {
      @apply transition-colors duration-150;

      &:hover {
        @apply bg-(--bg-tertiary);
      }
    }

    .col-prompt {
      @apply w-auto;

      .prompt-text {
        @apply line-clamp-2;
      }
    }

    .col-copies {
      @apply w-24 text-center;
    }

    .col-created,
    .col-updated {
      @apply w-32 text-(--text-secondary);
    }
  }
}
</style>
