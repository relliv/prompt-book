<template>
  <div class="prompts-page">
    <header class="page-header">
      <div class="project-info">
        <span class="project-icon">{{ selectedProject?.icon }}</span>
        <h1 class="project-name">{{ selectedProject?.name }}</h1>
      </div>
      <div class="header-actions">
        <FeatureDialog @submit="handleCreateFeature">
          <template #trigger>
            <button class="btn btn-secondary">
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              New Feature
            </button>
          </template>
        </FeatureDialog>
      </div>
    </header>

    <div class="content">
      <div v-if="featuresLoading" class="loading">Loading features...</div>
      <div v-else-if="features.length === 0" class="empty">
        <p>No features yet. Create your first feature to get started.</p>
      </div>
      <template v-else>
        <TabsRoot v-model="selectedFeatureId" class="tabs">
          <div class="tabs-header">
            <TabsList class="tabs-list">
              <TabsTrigger
                v-for="feature in features"
                :key="feature.id"
                :value="String(feature.id)"
                class="tabs-trigger"
              >
                {{ feature.name }}
                <span class="tabs-badge">{{ getFeaturePromptCount(feature.id) }}</span>

                <DropdownMenuRoot>
                  <DropdownMenuTrigger as-child>
                    <span
                      class="feature-menu-trigger"
                      role="button"
                      aria-label="Feature options"
                      @click.stop
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </span>
                  </DropdownMenuTrigger>

                  <DropdownMenuPortal>
                    <DropdownMenuContent class="feature-dropdown-menu" :side-offset="4" align="start">
                      <DropdownMenuItem
                        class="feature-dropdown-item"
                        @select="handleEditFeatureClick(feature)"
                      >
                        <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Feature
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        class="feature-dropdown-item feature-dropdown-item-danger"
                        @select="handleDeleteFeatureClick(feature)"
                      >
                        <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Feature
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenuPortal>
                </DropdownMenuRoot>
              </TabsTrigger>
            </TabsList>
            <PromptDialog
              v-if="selectedFeatureId"
              @submit="handleCreatePrompt"
            >
              <template #trigger>
                <button class="btn btn-primary btn-sm">
                  <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  New Prompt
                </button>
              </template>
            </PromptDialog>
          </div>

          <TabsContent
            v-for="feature in features"
            :key="feature.id"
            :value="String(feature.id)"
            class="tabs-content"
          >
            <div v-if="isLoading" class="loading">Loading prompts...</div>
            <div v-else-if="error" class="error">{{ error }}</div>
            <div v-else-if="featurePrompts.length === 0" class="empty-prompts">
              <p>No prompts in this feature yet.</p>
            </div>
            <table v-else class="prompts-table">
              <thead>
                <tr>
                  <th class="col-title">Title</th>
                  <th class="col-copies">Copies</th>
                  <th class="col-created">Created</th>
                  <th class="col-updated">Updated</th>
                  <th class="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="prompt in featurePrompts" :key="prompt.id">
                  <td class="col-title">
                    <div class="prompt-title">{{ prompt.title }}</div>
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
          </TabsContent>
        </TabsRoot>
      </template>
    </div>

    <FeatureDialog
      ref="editFeatureDialogRef"
      :feature="featureToEdit ?? undefined"
      @submit="handleUpdateFeature"
    />

    <ConfirmDialog
      ref="confirmDialogRef"
      :title="`Delete '${featureToDelete?.name}'?`"
      description="This will permanently delete the feature and all its prompts. This action cannot be undone."
      confirm-text="Delete"
      @confirm="handleConfirmDeleteFeature"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import {
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
} from 'reka-ui';
import PromptDialog from '@app/components/PromptDialog.vue';
import FeatureDialog from '@app/components/FeatureDialog.vue';
import ConfirmDialog from '@app/components/ConfirmDialog.vue';
import {
  useProjectsStore,
  usePromptsStore,
  useFeaturesStore,
} from '@app/shared/stores';
import { useToast } from '@app/composables/useToast';
import type { Prompt, Feature } from '@app/shared/models';

const route = useRoute();
const projectsStore = useProjectsStore();
const promptsStore = usePromptsStore();
const featuresStore = useFeaturesStore();
const toast = useToast();

const { selectedProject } = storeToRefs(projectsStore);
const { prompts, isLoading, error } = storeToRefs(promptsStore);
const { features, isLoading: featuresLoading } = storeToRefs(featuresStore);

const selectedFeatureId = ref<string>('');
const editFeatureDialogRef = ref<InstanceType<typeof FeatureDialog> | null>(null);
const confirmDialogRef = ref<InstanceType<typeof ConfirmDialog> | null>(null);
const featureToEdit = ref<Feature | null>(null);
const featureToDelete = ref<Feature | null>(null);

const featurePrompts = computed(() => {
  if (!selectedFeatureId.value) return [];
  const featureId = Number(selectedFeatureId.value);
  return prompts.value.filter(p => p.featureId === featureId);
});

const getFeaturePromptCount = (featureId: number) => {
  return prompts.value.filter(p => p.featureId === featureId).length;
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const loadData = async (projectId: number) => {
  await projectsStore.selectProject(projectId);
  await featuresStore.fetchFeatures(projectId);
  await promptsStore.fetchPrompts(projectId);

  // Select first feature by default
  if (features.value.length > 0 && !selectedFeatureId.value) {
    selectedFeatureId.value = String(features.value[0].id);
  }
};

const handleCreateFeature = async (name: string) => {
  const feature = await featuresStore.createFeature({ name });
  selectedFeatureId.value = String(feature.id);
  toast.success('Feature created');
};

const handleCreatePrompt = async (title: string, promptText: string) => {
  if (!selectedFeatureId.value) return;
  await promptsStore.createPrompt({
    featureId: Number(selectedFeatureId.value),
    title,
    prompt: promptText,
  });
  toast.success('Prompt created');
};

const handleUpdatePrompt = async (title: string, promptText: string, promptId?: number) => {
  if (promptId) {
    await promptsStore.updatePrompt({ id: promptId, title, prompt: promptText });
    toast.success('Prompt updated');
  }
};

const handleDeletePrompt = async (id: number) => {
  await promptsStore.deletePrompt(id);
  toast.success('Prompt deleted');
};

const handleCopyPrompt = async (prompt: Prompt) => {
  await navigator.clipboard.writeText(prompt.prompt);
  await promptsStore.incrementCopyCount(prompt.id);
  toast.success('Prompt copied to clipboard');
};

const handleEditFeatureClick = (feature: Feature) => {
  featureToEdit.value = feature;
  editFeatureDialogRef.value?.open();
};

const handleUpdateFeature = async (name: string, featureId?: number) => {
  if (featureId) {
    await featuresStore.updateFeature({ id: featureId, name });
    toast.success('Feature updated');
    featureToEdit.value = null;
  }
};

const handleDeleteFeatureClick = (feature: Feature) => {
  featureToDelete.value = feature;
  confirmDialogRef.value?.open();
};

const handleConfirmDeleteFeature = async () => {
  if (!featureToDelete.value) return;

  const deletedFeatureId = featureToDelete.value.id;
  await featuresStore.deleteFeature(deletedFeatureId);
  toast.success('Feature deleted');

  // Select another feature if the deleted one was selected
  if (selectedFeatureId.value === String(deletedFeatureId)) {
    selectedFeatureId.value = features.value.length > 0 ? String(features.value[0].id) : '';
  }

  featureToDelete.value = null;
};

onMounted(() => {
  const projectId = Number(route.params.id);
  if (projectId) {
    loadData(projectId);
  }
});

watch(
  () => route.params.id,
  newId => {
    if (newId) {
      selectedFeatureId.value = '';
      loadData(Number(newId));
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
    }
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

    &.btn-secondary {
      @apply bg-(--bg-tertiary) text-(--text-primary);

      &:hover {
        @apply bg-(--border-color);
      }
    }

    &.btn-sm {
      @apply px-3 py-1.5 text-xs;
    }
  }

  .content {
    @apply flex-1 overflow-auto;

    .loading,
    .error,
    .empty {
      @apply flex items-center justify-center h-full text-(--text-secondary) p-6;
    }

    .error {
      @apply text-red-500;
    }
  }

  .tabs {
    @apply flex flex-col h-full;

    .tabs-header {
      @apply flex items-center justify-between px-6 py-3 border-b border-(--border-color);
    }

    .tabs-list {
      @apply flex items-center gap-1;
    }

    .tabs-trigger {
      @apply flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border-none transition-colors duration-200;

      background-color: transparent;
      color: var(--text-secondary);

      &:hover {
        background-color: var(--bg-tertiary);
        color: var(--text-primary);

        .tabs-badge {
          @apply bg-(--border-color);
        }
      }

      &[data-state='active'] {
        background-color: var(--accent-color);
        color: white;

        .tabs-badge {
          @apply bg-white/20 text-white;
        }
      }

      .tabs-badge {
        @apply px-1.5 py-0.5 text-xs rounded-full bg-(--bg-tertiary) text-(--text-tertiary) min-w-5 text-center;
      }

      .feature-menu-trigger {
        @apply flex items-center justify-center w-5 h-5 rounded cursor-pointer opacity-0 transition-all duration-200 ml-1;

        color: inherit;

        svg {
          @apply w-4 h-4;
        }

        &:hover {
          @apply bg-black/10;
        }
      }

      &:hover .feature-menu-trigger {
        @apply opacity-100;
      }

      &[data-state='active'] .feature-menu-trigger:hover {
        @apply bg-white/20;
      }
    }

    .tabs-content {
      @apply flex-1 overflow-auto p-6;

      .empty-prompts {
        @apply flex items-center justify-center h-32 text-(--text-secondary);
      }
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

    .col-title {
      @apply w-auto;

      .prompt-title {
        @apply font-medium;
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

<style>
@reference 'tailwindcss';

.feature-dropdown-menu {
  @apply min-w-40 rounded-lg p-1 border border-(--border-color) bg-(--bg-secondary) shadow-lg z-50;

  animation: feature-dropdown-show 150ms cubic-bezier(0.16, 1, 0.3, 1);

  .feature-dropdown-item {
    @apply flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer outline-none transition-colors duration-150;

    color: var(--text-primary);

    &:hover,
    &[data-highlighted] {
      background-color: var(--bg-tertiary);
    }

    &.feature-dropdown-item-danger {
      color: #f85149;

      &:hover,
      &[data-highlighted] {
        background-color: rgb(248 81 73 / 10%);
      }
    }

    .menu-icon {
      @apply w-4 h-4;
    }
  }
}

@keyframes feature-dropdown-show {
  from {
    opacity: 0;
    transform: scale(0.96);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
