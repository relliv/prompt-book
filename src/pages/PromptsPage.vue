<template>
  <div class="prompts-page">
    <header class="page-header">
      <div class="project-info">
        <span class="project-icon">{{ selectedProject?.icon }}</span>
        <h1 class="project-name">{{ selectedProject?.name }}</h1>
      </div>
      <div class="header-actions">
        <span class="prompt-count">{{ promptCount }} prompts</span>
        <PromptDialog @submit="handleCreatePrompt">
          <template #trigger>
            <button class="btn btn-primary">
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              New Prompt
            </button>
          </template>
        </PromptDialog>
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
            <th class="col-actions">Actions</th>
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
            <td class="col-actions">
              <div class="action-buttons">
                <button class="action-btn" aria-label="Copy prompt" @click="handleCopyPrompt(prompt)">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <PromptDialog :prompt="prompt" @submit="handleUpdatePrompt">
                  <template #trigger>
                    <button class="action-btn" aria-label="Edit prompt">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </template>
                </PromptDialog>
                <button class="action-btn action-btn-danger" aria-label="Delete prompt" @click="handleDeletePrompt(prompt.id)">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
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
import PromptDialog from '@app/components/PromptDialog.vue';
import { useProjectsStore, usePromptsStore } from '@app/shared/stores';
import { useToast } from '@app/composables/useToast';
import type { Prompt } from '@app/shared/models';

const route = useRoute();
const projectsStore = useProjectsStore();
const promptsStore = usePromptsStore();
const toast = useToast();

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

const handleCreatePrompt = async (promptText: string) => {
  await promptsStore.createPrompt({ prompt: promptText });
};

const handleUpdatePrompt = async (promptText: string, promptId?: number) => {
  if (promptId) {
    await promptsStore.updatePrompt({ id: promptId, prompt: promptText });
  }
};

const handleDeletePrompt = async (id: number) => {
  await promptsStore.deletePrompt(id);
};

const handleCopyPrompt = async (prompt: Prompt) => {
  await navigator.clipboard.writeText(prompt.prompt);
  await promptsStore.incrementCopyCount(prompt.id);
  toast.success('Prompt copied to clipboard');
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

      .btn {
        @apply flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm cursor-pointer border-none transition-colors duration-200;

        .icon {
          @apply w-4 h-4;
        }

        &.btn-primary {
          @apply bg-(--accent-color) text-white;

          &:hover {
            @apply bg-(--accent-hover);
          }
        }
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

    .col-actions {
      @apply w-24;

      .action-buttons {
        @apply flex items-center gap-1;

        .action-btn {
          @apply w-8 h-8 flex items-center justify-center rounded-lg bg-transparent border-none cursor-pointer text-(--text-tertiary) transition-colors duration-200;

          &:hover {
            @apply bg-(--bg-tertiary) text-(--text-primary);
          }

          &.action-btn-danger:hover {
            @apply bg-red-500/10 text-red-500;
          }

          svg {
            @apply w-4 h-4;
          }
        }
      }
    }
  }
}
</style>
