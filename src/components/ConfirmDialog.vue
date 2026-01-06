<template>
  <DialogRoot v-model:open="isOpen">
    <DialogPortal>
      <DialogOverlay class="dialog-overlay" />
      <DialogContent
        class="dialog-content"
        @escape-key-down.prevent
        @interact-outside.prevent
      >
        <DialogTitle class="dialog-title">{{ title }}</DialogTitle>
        <DialogDescription class="dialog-description">
          {{ description }}
        </DialogDescription>

        <div class="dialog-actions">
          <DialogClose as-child>
            <button type="button" class="btn btn-secondary">Cancel</button>
          </DialogClose>
          <button
            type="button"
            class="btn btn-danger"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </button>
        </div>

        <DialogClose as-child>
          <button class="dialog-close-icon" aria-label="Close">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from 'reka-ui';

interface Props {
  title?: string;
  description?: string;
  confirmText?: string;
}

withDefaults(defineProps<Props>(), {
  title: 'Confirm',
  description: 'Are you sure you want to proceed?',
  confirmText: 'Confirm',
});

const emit = defineEmits<{
  confirm: [];
}>();

const isOpen = ref(false);

const handleConfirm = () => {
  emit('confirm');
  isOpen.value = false;
};

const open = () => {
  isOpen.value = true;
};

const close = () => {
  isOpen.value = false;
};

defineExpose({ open, close });
</script>

<style scoped>
@reference 'tailwindcss';

.dialog-overlay {
  @apply fixed inset-0 z-50 bg-black/60 backdrop-blur-sm;

  animation: overlay-show 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

.dialog-content {
  @apply fixed z-50 w-full max-w-md rounded-xl p-6 border border-(--border-color) bg-(--bg-secondary);

  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: content-show 150ms cubic-bezier(0.16, 1, 0.3, 1) backwards;

  .dialog-title {
    @apply text-xl font-semibold mb-2 text-(--text-primary);
  }

  .dialog-description {
    @apply text-sm mb-6 text-(--text-secondary);
  }

  .dialog-actions {
    @apply flex justify-end gap-3;

    .btn {
      @apply px-4 py-2 rounded-lg font-medium text-sm cursor-pointer border-none transition-colors duration-200;

      &.btn-secondary {
        @apply bg-(--bg-tertiary) text-(--text-primary);

        &:hover {
          @apply bg-(--border-color);
        }
      }

      &.btn-danger {
        @apply bg-red-600 text-white;

        &:hover {
          @apply bg-red-700;
        }
      }
    }
  }

  .dialog-close-icon {
    @apply absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-transparent border-none cursor-pointer text-(--text-tertiary) transition-colors duration-200;

    &:hover {
      @apply bg-(--bg-tertiary) text-(--text-primary);
    }

    svg {
      @apply w-5 h-5;
    }
  }
}

@keyframes overlay-show {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes content-show {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.96);
  }

  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
</style>
