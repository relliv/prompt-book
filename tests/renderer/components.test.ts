import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import App from '@app/App.vue';
import Home from '@app/pages/Home.vue';
import About from '@app/pages/About.vue';

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
    getAppVersion: vi.fn().mockResolvedValue('1.0.0'),
    getVersions: vi.fn().mockResolvedValue({
      electron: '39.0.0',
      chrome: '132.0.0',
      node: '20.0.0',
    }),
    getSystemInfo: vi.fn().mockResolvedValue({
      platform: 'darwin',
      arch: 'arm64',
      version: '21.0.0',
      hostname: 'test-machine',
    }),
    saveData: vi.fn().mockResolvedValue({
      success: true,
      message: 'Data saved',
    }),
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
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/about', component: { template: '<div>About</div>' } },
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
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/about', component: { template: '<div>About</div>' } },
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
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/about', component: { template: '<div>About</div>' } },
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

  it('4. Home.vue renders page with info cards and tech icons', () => {
    const wrapper = mount(Home);

    expect(wrapper.find('.section').exists()).toBe(true);
    expect(wrapper.findAll('.info-card').length).toBeGreaterThanOrEqual(3);
    expect(wrapper.find('.tech-icons').exists()).toBe(true);
    expect(wrapper.findAll('.tech-icon-item').length).toBe(6);
  });

  it('5. Home.vue loads data from electronAPI on mount', async () => {
    mount(Home);
    await vi.waitFor(
      () => {
        expect(window.electronAPI.api.getAppVersion).toHaveBeenCalled();
        expect(window.electronAPI.api.getSystemInfo).toHaveBeenCalled();
        expect(window.electronAPI.api.getVersions).toHaveBeenCalled();
      },
      { timeout: 500 }
    );
  });

  it('6. Home.vue tech icons are valid external links', () => {
    const wrapper = mount(Home);
    const techLinks = wrapper.findAll('.tech-icon-item');

    techLinks.forEach((link: any) => {
      expect(link.element.tagName).toBe('A');
      expect(link.attributes('target')).toBe('_blank');
      expect(link.attributes('href')).toBeTruthy();
    });
  });

  it('7. About.vue renders with main sections', () => {
    const wrapper = mount(About);

    expect(wrapper.find('.about-container').exists()).toBe(true);
    expect(wrapper.find('.about-container h1').text()).toContain('About');
    expect(wrapper.findAll('.about-section').length).toBeGreaterThanOrEqual(4);
  });

  it('8. About.vue displays features list with items', () => {
    const wrapper = mount(About);
    const featuresList = wrapper.find('.features-list');

    expect(featuresList.exists()).toBe(true);
    expect(featuresList.findAll('li').length).toBeGreaterThan(0);
    featuresList.findAll('li').forEach((item: any) => {
      expect(item.find('strong').exists()).toBe(true);
    });
  });

  it('9. About.vue renders links grid with external documentation links', () => {
    const wrapper = mount(About);
    const linkCards = wrapper.findAll('.link-card');

    expect(linkCards.length).toBeGreaterThanOrEqual(4);
    const hrefs = linkCards.map((card: any) => card.attributes('href'));
    expect(hrefs).toContain('https://www.electronjs.org');
    expect(hrefs).toContain('https://vuejs.org');
    expect(hrefs).toContain('https://vite.dev');
  });

  it('10. About.vue displays code block with project structure', () => {
    const wrapper = mount(About);
    const codeBlock = wrapper.find('.code-block');

    expect(codeBlock.exists()).toBe(true);
    expect(codeBlock.find('code').exists()).toBe(true);
    expect(codeBlock.text()).toContain('src/');
  });
});
