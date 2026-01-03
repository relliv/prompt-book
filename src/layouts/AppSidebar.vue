<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2 class="logo">Prompt Book</h2>
    </div>

    <div class="sidebar-content">
      <div class="section-header">
        <span class="section-title">Projects</span>
        <ProjectDialog @submit="handleCreateProject">
          <template #trigger>
            <button class="add-button" aria-label="Add new project">
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </template>
        </ProjectDialog>
      </div>

      <nav class="projects-list">
        <button
          v-for="project in projects"
          :key="project.id"
          class="project-item"
          :class="{ active: selectedProjectId === project.id }"
          @click="handleProjectClick(project.id)"
        >
          <span class="project-icon">{{ project.icon }}</span>
          <span class="project-name">{{ project.name }}</span>

          <DropdownMenuRoot>
            <DropdownMenuTrigger as-child>
              <span
                class="menu-trigger"
                role="button"
                aria-label="Project options"
                @click.stop
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </span>
            </DropdownMenuTrigger>

            <DropdownMenuPortal>
              <DropdownMenuContent class="dropdown-menu" :side-offset="4" align="start">
                <DropdownMenuItem
                  class="dropdown-menu-item"
                  @select="handleEditClick(project)"
                >
                  <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Project
                </DropdownMenuItem>
                <DropdownMenuItem
                  class="dropdown-menu-item dropdown-menu-item-danger"
                  @select="handleDeleteClick(project)"
                >
                  <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenuRoot>
        </button>
      </nav>
    </div>

    <ConfirmDialog
      ref="confirmDialogRef"
      :title="`Delete '${projectToDelete?.name}'?`"
      description="This will permanently delete the project and all its prompts. This action cannot be undone."
      confirm-text="Delete"
      @confirm="handleConfirmDelete"
    />

    <ProjectDialog
      ref="editDialogRef"
      :project="projectToEdit"
      @submit="handleUpdateProject"
    />
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
} from 'reka-ui';
import ProjectDialog, { type ProjectFormData } from '@app/components/ProjectDialog.vue';
import ConfirmDialog from '@app/components/ConfirmDialog.vue';
import { useProjectsStore } from '@app/shared/stores';
import { useToast } from '@app/composables/useToast';
import type { Project } from '@app/shared/models';

const router = useRouter();
const route = useRoute();
const projectsStore = useProjectsStore();
const toast = useToast();
const { projects, selectedProjectId } = storeToRefs(projectsStore);

const confirmDialogRef = ref<InstanceType<typeof ConfirmDialog> | null>(null);
const editDialogRef = ref<InstanceType<typeof ProjectDialog> | null>(null);
const projectToDelete = ref<Project | null>(null);
const projectToEdit = ref<ProjectFormData | undefined>(undefined);

const handleProjectClick = (projectId: number) => {
  router.push(`/project/${projectId}/prompts`);
};

const handleCreateProject = async (data: ProjectFormData) => {
  const project = await projectsStore.createProject({
    name: data.name,
    icon: data.icon || '📁',
    description: data.description || undefined,
  });
  router.push(`/project/${project.id}/prompts`);
};

const handleDeleteClick = (project: Project) => {
  projectToDelete.value = project;
  confirmDialogRef.value?.open();
};

const handleConfirmDelete = async () => {
  if (!projectToDelete.value) return;

  const deletedProjectId = projectToDelete.value.id;
  await projectsStore.deleteProject(deletedProjectId);
  toast.success('Project deleted');

  // Navigate to home if the deleted project was currently open
  if (route.params.id && Number(route.params.id) === deletedProjectId) {
    router.push('/');
  }

  projectToDelete.value = null;
};

const handleEditClick = (project: Project) => {
  projectToEdit.value = {
    id: String(project.id),
    name: project.name,
    icon: project.icon,
    description: project.description || '',
  };
  editDialogRef.value?.open();
};

const handleUpdateProject = async (data: ProjectFormData) => {
  if (!data.id) return;

  await projectsStore.updateProject({
    id: Number(data.id),
    name: data.name,
    icon: data.icon || '📁',
    description: data.description || undefined,
  });
  toast.success('Project updated');
  projectToEdit.value = undefined;
};

onMounted(() => {
  projectsStore.fetchProjects();
});
</script>

<style scoped>
@reference 'tailwindcss';

.sidebar {
  @apply flex flex-col w-64 h-full border-r border-(--border-color) bg-(--bg-secondary);

  .sidebar-header {
    @apply flex items-center px-4 py-4 border-b border-(--border-color);

    .logo {
      @apply text-lg font-bold text-(--text-primary) m-0;
    }
  }

  .sidebar-content {
    @apply flex-1 overflow-y-auto p-3;

    .section-header {
      @apply flex items-center justify-between mb-2 px-1;

      .section-title {
        @apply text-xs font-semibold uppercase tracking-wider text-(--text-tertiary);
      }

      .add-button {
        @apply flex items-center justify-center w-6 h-6 rounded bg-transparent border-none cursor-pointer text-(--text-tertiary) transition-colors duration-200;

        &:hover {
          @apply bg-(--bg-tertiary) text-(--text-primary);
        }

        .icon {
          @apply w-4 h-4;
        }
      }
    }

    .projects-list {
      @apply flex flex-col gap-1;

      .project-item {
        @apply relative flex items-center gap-3 w-full px-3 py-2 rounded-lg bg-transparent border-none cursor-pointer text-left text-(--text-secondary) transition-colors duration-200;

        &::before {
          @apply absolute left-0 top-1/2 w-1 h-1 rounded-full bg-transparent transition-colors duration-200;

          content: '';
          transform: translateY(-50%);
        }

        .project-icon {
          @apply text-base;
        }

        .project-name {
          @apply flex-1 text-sm font-medium truncate;
        }

        &:hover {
          @apply text-(--text-primary);
        }

        &.active {
          @apply text-(--text-primary);

          &::before {
            background-color: var(--accent-color);
          }
        }
      }

      .menu-trigger {
        @apply flex items-center justify-center w-6 h-6 rounded cursor-pointer transition-all duration-200;

        color: var(--text-tertiary);

        svg {
          @apply w-4 h-4;
        }

        &:hover {
          @apply bg-(--border-color);

          color: var(--text-primary);
        }
      }
    }
  }
}
</style>

<style>
@reference 'tailwindcss';

.dropdown-menu {
  @apply min-w-48 rounded-lg p-1 border border-(--border-color) bg-(--bg-secondary) shadow-lg z-50;

  animation: dropdown-menu-show 150ms cubic-bezier(0.16, 1, 0.3, 1);

  .dropdown-menu-item {
    @apply flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer outline-none transition-colors duration-150;

    color: var(--text-primary);

    &:hover,
    &[data-highlighted] {
      background-color: var(--bg-tertiary);
    }

    &.dropdown-menu-item-danger {
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

@keyframes dropdown-menu-show {
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
