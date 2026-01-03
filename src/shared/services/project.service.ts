import type { Project } from '@app/shared/models';

export interface CreateProjectInput {
  name: string;
  description?: string;
  icon?: string;
}

export interface UpdateProjectInput {
  id: number;
  name?: string;
  description?: string;
  icon?: string;
}

export const projectService = {
  async getAll(): Promise<Project[]> {
    return window.electronAPI.api.getProjects();
  },

  async getById(id: number): Promise<Project | null> {
    return window.electronAPI.api.getProject({ id });
  },

  async create(input: CreateProjectInput): Promise<Project> {
    return window.electronAPI.api.createProject(input);
  },

  async update(input: UpdateProjectInput): Promise<Project | null> {
    return window.electronAPI.api.updateProject(input);
  },

  async delete(id: number): Promise<{ success: boolean }> {
    return window.electronAPI.api.deleteProject({ id });
  },

  async open(id: number): Promise<Project | null> {
    return window.electronAPI.api.openProject({ id });
  },
};
