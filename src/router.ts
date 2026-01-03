import { createRouter, createMemoryHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import Home from './pages/Home.vue';
import PromptsPage from './pages/PromptsPage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
  },
  {
    path: '/project/:id/prompts',
    name: 'Prompts',
    component: PromptsPage,
  },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export default router;
