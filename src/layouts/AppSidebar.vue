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
          @click="selectProject(project.id)"
        >
          <span class="project-icon">{{ project.icon }}</span>
          <span class="project-name">{{ project.name }}</span>
        </button>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ProjectDialog, { type ProjectFormData } from '@app/components/ProjectDialog.vue';

interface Project {
  id: number;
  name: string;
  icon: string | null;
  description: string | null;
}

const projects = ref<Project[]>([]);
const selectedProjectId = ref<number | null>(null);
const isLoading = ref(true);

const loadProjects = async () => {
  try {
    isLoading.value = true;
    const result = await window.electronAPI.api.getProjects();
    projects.value = result;
  } catch (error) {
    console.error('Failed to load projects:', error);
  } finally {
    isLoading.value = false;
  }
};

const selectProject = (id: number) => {
  selectedProjectId.value = id;
};

const handleCreateProject = async (data: ProjectFormData) => {
  try {
    const newProject = await window.electronAPI.api.createProject({
      name: data.name,
      icon: data.icon || '📁',
      description: data.description || undefined,
    });
    projects.value.push(newProject);
    selectedProjectId.value = newProject.id;
  } catch (error) {
    console.error('Failed to create project:', error);
  }
};

onMounted(() => {
  loadProjects();
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
        @apply flex items-center gap-3 w-full px-3 py-2 rounded-lg bg-transparent border-none cursor-pointer text-left text-(--text-secondary) transition-colors duration-200;

        &:hover {
          @apply bg-(--bg-tertiary) text-(--text-primary);
        }

        &.active {
          @apply bg-(--accent-color) text-white;
        }

        .project-icon {
          @apply text-base;
        }

        .project-name {
          @apply text-sm font-medium truncate;
        }
      }
    }
  }
}
</style>
