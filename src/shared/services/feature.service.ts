import type { Feature } from '@app/shared/models';

export interface CreateFeatureInput {
  projectId: number;
  name: string;
}

export interface UpdateFeatureInput {
  id: number;
  name: string;
}

export const featureService = {
  async getByProject(projectId: number): Promise<Feature[]> {
    return window.electronAPI.api.getFeaturesByProject({ projectId });
  },

  async getById(id: number): Promise<Feature | null> {
    return window.electronAPI.api.getFeature({ id });
  },

  async create(input: CreateFeatureInput): Promise<Feature> {
    return window.electronAPI.api.createFeature(input);
  },

  async update(input: UpdateFeatureInput): Promise<Feature | null> {
    return window.electronAPI.api.updateFeature(input);
  },

  async delete(id: number): Promise<{ success: boolean }> {
    return window.electronAPI.api.deleteFeature({ id });
  },

  async incrementCopyCount(id: number): Promise<Feature | null> {
    return window.electronAPI.api.incrementFeatureCopyCount({ id });
  },
};
