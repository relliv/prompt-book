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
  };
  platform: NodeJS.Platform;
};

// Declare global window interface extension
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
