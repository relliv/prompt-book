import type { Prompt } from '@app/shared/models';

export interface CreatePromptInput {
  projectId: number;
  featureId: number;
  title: string;
  prompt: string;
}

export interface UpdatePromptInput {
  id: number;
  title: string;
  prompt: string;
}

export interface PromptSearchResult extends Prompt {
  projectName: string;
  projectIcon: string | null;
  featureName: string;
}

export const promptService = {
  async getByProject(projectId: number): Promise<Prompt[]> {
    return window.electronAPI.api.getPromptsByProject({ projectId });
  },

  async getById(id: number): Promise<Prompt | null> {
    return window.electronAPI.api.getPrompt({ id });
  },

  async create(input: CreatePromptInput): Promise<Prompt> {
    return window.electronAPI.api.createPrompt(input);
  },

  async update(input: UpdatePromptInput): Promise<Prompt | null> {
    return window.electronAPI.api.updatePrompt(input);
  },

  async delete(id: number): Promise<{ success: boolean }> {
    return window.electronAPI.api.deletePrompt({ id });
  },

  async incrementCopyCount(id: number): Promise<Prompt | null> {
    return window.electronAPI.api.incrementPromptCopyCount({ id });
  },

  async search(query?: string, limit?: number): Promise<PromptSearchResult[]> {
    return window.electronAPI.api.searchPrompts({ query, limit });
  },
};
