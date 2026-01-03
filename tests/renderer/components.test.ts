import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import App from '@app/App.vue';
import Home from '@app/pages/Home.vue';

// Mock localStorage
if (typeof window !== 'undefined' && !window.localStorage) {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });
}

// Mock electronAPI
const createMockElectronAPI = () => ({
  api: {
    // Project API mocks
    getProjects: vi.fn().mockResolvedValue([
      { id: 1, name: 'Test Project 1', icon: '📁', description: null },
      {
        id: 2,
        name: 'Test Project 2',
        icon: '💻',
        description: 'A test project',
      },
    ]),
    getProject: vi.fn().mockResolvedValue({
      id: 1,
      name: 'Test Project',
      icon: '📁',
      description: null,
    }),
    createProject: vi.fn().mockResolvedValue({
      id: 3,
      name: 'New Project',
      icon: '📁',
      description: null,
    }),
    updateProject: vi.fn().mockResolvedValue({
      id: 1,
      name: 'Updated Project',
      icon: '📁',
      description: null,
    }),
    deleteProject: vi.fn().mockResolvedValue({ success: true }),
    openProject: vi.fn().mockResolvedValue({
      id: 1,
      name: 'Test Project',
      icon: '📁',
      description: null,
      lastOpenedAt: new Date(),
    }),
  },
  platform: 'darwin',
});

describe('Vue Components', () => {
  let pinia: ReturnType<typeof createPinia>;

  beforeEach(() => {
    localStorage.clear();
    pinia = createPinia();
    setActivePinia(pinia);
    // @ts-expect-error: Mock object uses vi.fn() for testing purposes
    window.electronAPI = createMockElectronAPI();
  });

  it('1. App.vue renders with layout structure', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', redirect: '/home' },
        { path: '/home', component: { template: '<div>Home</div>' } },
      ],
    });

    const wrapper = mount(App, {
      global: { plugins: [router, pinia] },
    });

    expect(wrapper.find('.layout').exists()).toBe(true);
    expect(wrapper.find('.sidebar').exists()).toBe(true);
    expect(wrapper.find('.navbar').exists()).toBe(true);
    expect(wrapper.text()).toContain('Prompt Book');
  });

  it('2. App.vue sidebar displays projects list', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', redirect: '/home' },
        { path: '/home', component: { template: '<div>Home</div>' } },
      ],
    });

    const wrapper = mount(App, {
      global: { plugins: [router, pinia] },
    });

    // Wait for async loadProjects to complete
    await vi.waitFor(() => {
      expect(wrapper.findAll('.project-item').length).toBeGreaterThan(0);
    });

    const addButton = wrapper.find('.add-button');
    expect(addButton.exists()).toBe(true);
  });

  it('3. App.vue navbar has search and settings', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', redirect: '/home' },
        { path: '/home', component: { template: '<div>Home</div>' } },
      ],
    });

    const wrapper = mount(App, {
      global: { plugins: [router, pinia] },
    });

    const searchInput = wrapper.find('.search-input');
    expect(searchInput.exists()).toBe(true);

    const settingsButton = wrapper.find('.action-button');
    expect(settingsButton.exists()).toBe(true);
  });

  it('4. Home.vue renders welcome message', () => {
    const wrapper = mount(Home);

    expect(wrapper.find('.home').exists()).toBe(true);
    expect(wrapper.find('.welcome').exists()).toBe(true);
    expect(wrapper.text()).toContain('Welcome to Prompt Book');
  });
});
