import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Feature } from '@app/shared/models';
import {
  featureService,
  type CreateFeatureInput,
  type UpdateFeatureInput,
} from '@app/shared/services';

export const useFeaturesStore = defineStore('features', () => {
  const features = ref<Feature[]>([]);
  const currentProjectId = ref<number | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const featureCount = computed(() => features.value.length);

  async function fetchFeatures(projectId: number) {
    isLoading.value = true;
    error.value = null;
    currentProjectId.value = projectId;

    try {
      features.value = await featureService.getByProject(projectId);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch features';
      console.error('Failed to fetch features:', e);
    } finally {
      isLoading.value = false;
    }
  }

  async function createFeature(input: Omit<CreateFeatureInput, 'projectId'>) {
    if (currentProjectId.value === null) {
      throw new Error('No project selected');
    }

    error.value = null;

    try {
      const newFeature = await featureService.create({
        projectId: currentProjectId.value,
        name: input.name,
      });
      features.value.unshift(newFeature);
      return newFeature;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create feature';
      console.error('Failed to create feature:', e);
      throw e;
    }
  }

  async function updateFeature(input: UpdateFeatureInput) {
    error.value = null;

    try {
      const updatedFeature = await featureService.update(input);
      if (updatedFeature) {
        const index = features.value.findIndex(f => f.id === input.id);
        if (index !== -1) {
          features.value[index] = updatedFeature;
        }
      }
      return updatedFeature;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update feature';
      console.error('Failed to update feature:', e);
      throw e;
    }
  }

  async function deleteFeature(id: number) {
    error.value = null;

    try {
      await featureService.delete(id);
      features.value = features.value.filter(f => f.id !== id);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete feature';
      console.error('Failed to delete feature:', e);
      throw e;
    }
  }

  async function incrementCopyCount(id: number) {
    try {
      const updatedFeature = await featureService.incrementCopyCount(id);
      if (updatedFeature) {
        const index = features.value.findIndex(f => f.id === id);
        if (index !== -1) {
          features.value[index] = updatedFeature;
        }
      }
      return updatedFeature;
    } catch (e) {
      console.error('Failed to increment copy count:', e);
      throw e;
    }
  }

  function clearFeatures() {
    features.value = [];
    currentProjectId.value = null;
  }

  return {
    features,
    currentProjectId,
    featureCount,
    isLoading,
    error,
    fetchFeatures,
    createFeature,
    updateFeature,
    deleteFeature,
    incrementCopyCount,
    clearFeatures,
  };
});
