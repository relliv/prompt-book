<template>
  <ToastProvider :duration="3000">
    <ToastRoot
      v-for="toast in toasts"
      :key="toast.id"
      :class="['toast', `toast-${toast.type || 'info'}`]"
      @update:open="open => !open && removeToast(toast.id)"
    >
      <div class="toast-content">
        <ToastTitle v-if="toast.title" class="toast-title">
          {{ toast.title }}
        </ToastTitle>
        <ToastDescription class="toast-description">
          {{ toast.description }}
        </ToastDescription>
      </div>
      <ToastClose class="toast-close" aria-label="Close">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </ToastClose>
    </ToastRoot>

    <ToastViewport class="toast-viewport" />
  </ToastProvider>
</template>

<script setup lang="ts">
import {
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastViewport,
} from 'reka-ui';
import { useToast } from '@app/composables/useToast';

const { toasts, removeToast } = useToast();
</script>

<style scoped>
@reference 'tailwindcss';

.toast-viewport {
  @apply fixed bottom-0 right-0 z-[100] flex flex-col gap-2 p-4 w-96 max-w-[100vw] m-0 list-none outline-none;
}

.toast {
  @apply flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg;

  background-color: var(--bg-secondary);
  border-color: var(--border-color);
  animation: toast-slide-in 150ms cubic-bezier(0.16, 1, 0.3, 1);

  &[data-state='closed'] {
    animation: toast-hide 100ms ease-in;
  }

  &[data-swipe='move'] {
    transform: translateX(var(--reka-toast-swipe-move-x));
  }

  &[data-swipe='cancel'] {
    transform: translateX(0);
    transition: transform 200ms ease-out;
  }

  &[data-swipe='end'] {
    animation: toast-swipe-out 100ms ease-out;
  }

  &.toast-success {
    @apply border-green-500/30;

    .toast-title {
      @apply text-green-500;
    }
  }

  &.toast-error {
    @apply border-red-500/30;

    .toast-title {
      @apply text-red-500;
    }
  }

  &.toast-info {
    border-color: var(--accent-color);

    .toast-title {
      color: var(--accent-color);
    }
  }

  .toast-content {
    @apply flex-1;

    .toast-title {
      @apply text-sm font-semibold mb-1;
    }

    .toast-description {
      @apply text-sm;

      color: var(--text-secondary);
    }
  }

  .toast-close {
    @apply w-5 h-5 flex items-center justify-center rounded bg-transparent border-none cursor-pointer transition-colors duration-200;

    color: var(--text-tertiary);

    &:hover {
      color: var(--text-primary);
    }

    svg {
      @apply w-4 h-4;
    }
  }
}

@keyframes toast-slide-in {
  from {
    transform: translateX(100%);
  }

  to {
    transform: translateX(0);
  }
}

@keyframes toast-hide {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

@keyframes toast-swipe-out {
  from {
    transform: translateX(var(--reka-toast-swipe-end-x));
  }

  to {
    transform: translateX(100%);
  }
}
</style>
