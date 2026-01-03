import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ElectronAPI } from '@preload/preload';

describe('Renderer Process', () => {
  beforeEach(() => {
    // Mock the electronAPI
    (global as { window?: Window & { electronAPI: ElectronAPI } }).window = {
      electronAPI: {
        api: {
          getProjects: vi.fn(),
          getProject: vi.fn(),
          createProject: vi.fn(),
          updateProject: vi.fn(),
          deleteProject: vi.fn(),
        },
        platform: 'darwin' as NodeJS.Platform,
      },
    } as unknown as Window & { electronAPI: ElectronAPI };
  });

  it('should have window.electronAPI available', () => {
    expect(window.electronAPI).toBeDefined();
    expect(window.electronAPI.api).toBeDefined();
  });

  it('should have platform information', () => {
    expect(window.electronAPI.platform).toBeDefined();
    expect(typeof window.electronAPI.platform).toBe('string');
  });

  it('should call getProjects API correctly', async () => {
    const mockGetProjects = vi.mocked(window.electronAPI.api.getProjects);
    const mockData = [
      {
        id: 1,
        name: 'Project 1',
        icon: '📁',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    mockGetProjects.mockResolvedValue(mockData);

    const result = await window.electronAPI.api.getProjects();

    expect(mockGetProjects).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });
});
