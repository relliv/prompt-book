<template>
  <div class="home">
    <div class="welcome">
      <h1>Welcome to Prompt Book</h1>
      <p>Select a project from the sidebar or create a new one to get started.</p>
    </div>

    <div v-if="recentlyOpenedProjects.length > 0" class="recent-projects">
      <h2 class="section-title">Last Opened Projects</h2>
      <div class="projects-grid">
        <button
          v-for="project in recentlyOpenedProjects"
          :key="project.id"
          class="project-card"
          @click="openProject(project.id)"
        >
          <span class="project-icon">{{ project.icon }}</span>
          <div class="project-info">
            <span class="project-name">{{ project.name }}</span>
            <span class="project-date">{{ formatDate(project.lastOpenedAt!) }}</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useProjectsStore } from '@app/shared/stores';

const router = useRouter();
const projectsStore = useProjectsStore();
const { recentlyOpenedProjects } = storeToRefs(projectsStore);

const formatDate = (date: Date) => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return then.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const openProject = (projectId: number) => {
  router.push(`/project/${projectId}/prompts`);
};

onMounted(() => {
  projectsStore.fetchProjects();
});
</script>

<style scoped>
@reference 'tailwindcss';

.home {
  @apply flex flex-col items-center justify-center h-full gap-12 p-8;

  .welcome {
    @apply text-center;

    h1 {
      @apply text-2xl font-bold mb-2 text-(--text-primary);
    }

    p {
      @apply text-(--text-secondary);
    }
  }

  .recent-projects {
    @apply w-full max-w-2xl;

    .section-title {
      @apply text-sm font-semibold uppercase tracking-wider text-(--text-tertiary) mb-4;
    }

    .projects-grid {
      @apply flex flex-col gap-2;

      .project-card {
        @apply flex items-center gap-4 w-full px-4 py-3 rounded-lg border border-(--border-color) bg-(--bg-secondary) cursor-pointer transition-all duration-200 text-left;

        &:hover {
          @apply border-(--accent-color) bg-(--bg-tertiary);
        }

        .project-icon {
          @apply text-2xl;
        }

        .project-info {
          @apply flex flex-col flex-1;

          .project-name {
            @apply text-sm font-medium text-(--text-primary);
          }

          .project-date {
            @apply text-xs text-(--text-tertiary);
          }
        }
      }
    }
  }
}
</style>
