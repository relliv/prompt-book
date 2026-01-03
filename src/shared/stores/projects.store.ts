import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Project } from '@app/shared/models';
import {
  projectService,
  type CreateProjectInput,
  type UpdateProjectInput,
} from '@app/shared/services';

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([]);
  const selectedProjectId = ref<number | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const selectedProject = computed(
    () => projects.value.find(p => p.id === selectedProjectId.value) ?? null
  );

  const projectCount = computed(() => projects.value.length);

  const recentlyOpenedProjects = computed(() =>
    projects.value
      .filter(
        (p): p is typeof p & { lastOpenedAt: Date } => p.lastOpenedAt !== null
      )
      .sort(
        (a, b) =>
          new Date(b.lastOpenedAt).getTime() -
          new Date(a.lastOpenedAt).getTime()
      )
      .slice(0, 5)
  );

  async function fetchProjects() {
    isLoading.value = true;
    error.value = null;

    try {
      projects.value = await projectService.getAll();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch projects';
      console.error('Failed to fetch projects:', e);
    } finally {
      isLoading.value = false;
    }
  }

  async function createProject(input: CreateProjectInput) {
    error.value = null;

    try {
      const newProject = await projectService.create(input);
      projects.value.push(newProject);
      selectedProjectId.value = newProject.id;
      return newProject;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create project';
      console.error('Failed to create project:', e);
      throw e;
    }
  }

  async function updateProject(input: UpdateProjectInput) {
    error.value = null;

    try {
      const updatedProject = await projectService.update(input);
      if (updatedProject) {
        const index = projects.value.findIndex(p => p.id === input.id);
        if (index !== -1) {
          projects.value[index] = updatedProject;
        }
      }
      return updatedProject;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update project';
      console.error('Failed to update project:', e);
      throw e;
    }
  }

  async function deleteProject(id: number) {
    error.value = null;

    try {
      await projectService.delete(id);
      projects.value = projects.value.filter(p => p.id !== id);
      if (selectedProjectId.value === id) {
        selectedProjectId.value = null;
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete project';
      console.error('Failed to delete project:', e);
      throw e;
    }
  }

  async function selectProject(id: number | null) {
    selectedProjectId.value = id;

    if (id !== null) {
      try {
        const updatedProject = await projectService.open(id);
        if (updatedProject) {
          const index = projects.value.findIndex(p => p.id === id);
          if (index !== -1) {
            projects.value[index] = updatedProject;
          }
        }
      } catch (e) {
        console.error('Failed to update lastOpenedAt:', e);
      }
    }
  }

  return {
    projects,
    selectedProjectId,
    selectedProject,
    projectCount,
    recentlyOpenedProjects,
    isLoading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    selectProject,
  };
});
