import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Prompt } from '@app/shared/models';
import {
  promptService,
  type CreatePromptInput,
  type UpdatePromptInput,
} from '@app/shared/services';

export const usePromptsStore = defineStore('prompts', () => {
  const prompts = ref<Prompt[]>([]);
  const currentProjectId = ref<number | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const promptCount = computed(() => prompts.value.length);

  async function fetchPrompts(projectId: number) {
    isLoading.value = true;
    error.value = null;
    currentProjectId.value = projectId;

    try {
      prompts.value = await promptService.getByProject(projectId);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch prompts';
      console.error('Failed to fetch prompts:', e);
    } finally {
      isLoading.value = false;
    }
  }

  async function createPrompt(input: Omit<CreatePromptInput, 'projectId'>) {
    if (currentProjectId.value === null) {
      throw new Error('No project selected');
    }

    error.value = null;

    try {
      const newPrompt = await promptService.create({
        projectId: currentProjectId.value,
        prompt: input.prompt,
      });
      prompts.value.unshift(newPrompt);
      return newPrompt;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create prompt';
      console.error('Failed to create prompt:', e);
      throw e;
    }
  }

  async function updatePrompt(input: UpdatePromptInput) {
    error.value = null;

    try {
      const updatedPrompt = await promptService.update(input);
      if (updatedPrompt) {
        const index = prompts.value.findIndex(p => p.id === input.id);
        if (index !== -1) {
          prompts.value[index] = updatedPrompt;
        }
      }
      return updatedPrompt;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update prompt';
      console.error('Failed to update prompt:', e);
      throw e;
    }
  }

  async function deletePrompt(id: number) {
    error.value = null;

    try {
      await promptService.delete(id);
      prompts.value = prompts.value.filter(p => p.id !== id);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete prompt';
      console.error('Failed to delete prompt:', e);
      throw e;
    }
  }

  async function incrementCopyCount(id: number) {
    try {
      const updatedPrompt = await promptService.incrementCopyCount(id);
      if (updatedPrompt) {
        const index = prompts.value.findIndex(p => p.id === id);
        if (index !== -1) {
          prompts.value[index] = updatedPrompt;
        }
      }
      return updatedPrompt;
    } catch (e) {
      console.error('Failed to increment copy count:', e);
      throw e;
    }
  }

  function clearPrompts() {
    prompts.value = [];
    currentProjectId.value = null;
  }

  return {
    prompts,
    currentProjectId,
    promptCount,
    isLoading,
    error,
    fetchPrompts,
    createPrompt,
    updatePrompt,
    deletePrompt,
    incrementCopyCount,
    clearPrompts,
  };
});
