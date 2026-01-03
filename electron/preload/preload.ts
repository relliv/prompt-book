import { contextBridge, ipcRenderer } from 'electron';
import { createClient } from '@egoist/tipc/renderer';
import type { AppRouter } from '@shared/ipc';

console.log('[Preload] Script started');

// Create type-safe IPC client
const api = createClient<AppRouter>({
  ipcInvoke: ipcRenderer.invoke.bind(ipcRenderer),
});

console.log('[Preload] API client created:', !!api);

// Project input types for renderer
interface CreateProjectInput {
  name: string;
  description?: string;
  icon?: string;
}

interface UpdateProjectInput {
  id: number;
  name?: string;
  description?: string;
  icon?: string;
}

// Prompt input types for renderer
interface CreatePromptInput {
  projectId: number;
  featureId: number;
  prompt: string;
}

interface UpdatePromptInput {
  id: number;
  prompt: string;
}

// Feature input types for renderer
interface CreateFeatureInput {
  projectId: number;
  name: string;
}

interface UpdateFeatureInput {
  id: number;
  name: string;
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
// Note: We expose each method individually because Proxy objects cannot be cloned by contextBridge
contextBridge.exposeInMainWorld('electronAPI', {
  // Expose individual API methods
  api: {
    // Project CRUD operations
    getProjects: () => api.getProjects(),
    getProject: (input: { id: number }) => api.getProject(input),
    createProject: (input: CreateProjectInput) => api.createProject(input),
    updateProject: (input: UpdateProjectInput) => api.updateProject(input),
    deleteProject: (input: { id: number }) => api.deleteProject(input),
    openProject: (input: { id: number }) => api.openProject(input),

    // Prompt CRUD operations
    getPromptsByProject: (input: { projectId: number }) =>
      api.getPromptsByProject(input),
    getPrompt: (input: { id: number }) => api.getPrompt(input),
    createPrompt: (input: CreatePromptInput) => api.createPrompt(input),
    updatePrompt: (input: UpdatePromptInput) => api.updatePrompt(input),
    deletePrompt: (input: { id: number }) => api.deletePrompt(input),
    incrementPromptCopyCount: (input: { id: number }) =>
      api.incrementPromptCopyCount(input),

    // Feature CRUD operations
    getFeaturesByProject: (input: { projectId: number }) =>
      api.getFeaturesByProject(input),
    getFeature: (input: { id: number }) => api.getFeature(input),
    createFeature: (input: CreateFeatureInput) => api.createFeature(input),
    updateFeature: (input: UpdateFeatureInput) => api.updateFeature(input),
    deleteFeature: (input: { id: number }) => api.deleteFeature(input),
    incrementFeatureCopyCount: (input: { id: number }) =>
      api.incrementFeatureCopyCount(input),
  },

  // Additional platform info
  platform: process.platform,
});

console.log('[Preload] electronAPI exposed to main world');

// Project type for renderer
export interface Project {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastOpenedAt: Date | null;
}

// Prompt type for renderer
export interface Prompt {
  id: number;
  projectId: number;
  featureId: number;
  prompt: string;
  copyCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Feature type for renderer
export interface Feature {
  id: number;
  projectId: number;
  name: string;
  copyCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Type definitions for renderer process
export type ElectronAPI = {
  api: {
    // Project operations
    getProjects: () => Promise<Project[]>;
    getProject: (input: { id: number }) => Promise<Project | null>;
    createProject: (input: CreateProjectInput) => Promise<Project>;
    updateProject: (input: UpdateProjectInput) => Promise<Project | null>;
    deleteProject: (input: { id: number }) => Promise<{ success: boolean }>;
    openProject: (input: { id: number }) => Promise<Project | null>;
    // Prompt operations
    getPromptsByProject: (input: { projectId: number }) => Promise<Prompt[]>;
    getPrompt: (input: { id: number }) => Promise<Prompt | null>;
    createPrompt: (input: CreatePromptInput) => Promise<Prompt>;
    updatePrompt: (input: UpdatePromptInput) => Promise<Prompt | null>;
    deletePrompt: (input: { id: number }) => Promise<{ success: boolean }>;
    incrementPromptCopyCount: (input: { id: number }) => Promise<Prompt | null>;
    // Feature operations
    getFeaturesByProject: (input: { projectId: number }) => Promise<Feature[]>;
    getFeature: (input: { id: number }) => Promise<Feature | null>;
    createFeature: (input: CreateFeatureInput) => Promise<Feature>;
    updateFeature: (input: UpdateFeatureInput) => Promise<Feature | null>;
    deleteFeature: (input: { id: number }) => Promise<{ success: boolean }>;
    incrementFeatureCopyCount: (input: {
      id: number;
    }) => Promise<Feature | null>;
  };
  platform: NodeJS.Platform;
};

// Declare global window interface extension
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
