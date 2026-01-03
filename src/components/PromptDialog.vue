<template>
  <DialogRoot v-model:open="isOpen">
    <DialogTrigger as-child>
      <slot name="trigger" />
    </DialogTrigger>

    <DialogPortal>
      <DialogOverlay class="dialog-overlay" />
      <DialogContent :class="['dialog-content', { 'full-screen': isFullScreen }]">
        <div class="dialog-header">
          <div class="header-left">
            <DialogTitle class="dialog-title">
              {{ isEditMode ? 'Edit Prompt' : 'Create New Prompt' }}
            </DialogTitle>
            <DialogDescription class="dialog-description">
              {{ isEditMode ? 'Update your prompt below.' : 'Write your prompt below.' }}
            </DialogDescription>
          </div>
          <div class="header-actions">
            <button
              type="button"
              class="icon-btn"
              :aria-label="isFullScreen ? 'Exit full screen' : 'Enter full screen'"
              @click="toggleFullScreen"
            >
              <svg v-if="isFullScreen" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9L4 4m0 0v5m0-5h5m6 6l5 5m0 0v-5m0 5h-5M9 15l-5 5m0 0v-5m0 5h5m6-6l5-5m0 0v5m0-5h-5" />
              </svg>
              <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            <DialogClose as-child>
              <button class="icon-btn" aria-label="Close">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </DialogClose>
          </div>
        </div>

        <form class="dialog-form" @submit.prevent="handleSubmit">
          <div class="form-field">
            <textarea
              ref="textareaRef"
              v-model="promptText"
              class="prompt-textarea"
              placeholder="Enter your prompt here..."
              required
            />
          </div>

          <div class="dialog-actions">
            <DialogClose as-child>
              <button type="button" class="btn btn-secondary">Cancel</button>
            </DialogClose>
            <button type="submit" class="btn btn-primary" :disabled="!promptText.trim()">
              {{ isEditMode ? 'Save Changes' : 'Create Prompt' }}
            </button>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from 'reka-ui';
import type { Prompt } from '@app/shared/models';

interface Props {
  prompt?: Prompt;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  submit: [promptText: string, promptId?: number];
}>();

const isOpen = ref(false);
const isFullScreen = ref(false);
const promptText = ref('');
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const isEditMode = props.prompt !== undefined;

const toggleFullScreen = () => {
  isFullScreen.value = !isFullScreen.value;
};

watch(isOpen, async open => {
  if (open) {
    promptText.value = props.prompt?.prompt ?? '';
    isFullScreen.value = false;
    await nextTick();
    textareaRef.value?.focus();
  }
});

watch(
  () => props.prompt,
  newPrompt => {
    if (isOpen.value && newPrompt) {
      promptText.value = newPrompt.prompt;
    }
  },
  { deep: true }
);

const handleSubmit = () => {
  if (!promptText.value.trim()) return;

  emit('submit', promptText.value.trim(), props.prompt?.id);
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
  @apply fixed z-50 flex flex-col rounded-xl border border-(--border-color) bg-(--bg-secondary);

  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 48px);
  max-width: 720px;
  height: auto;
  max-height: calc(100% - 48px);
  animation: content-show 150ms cubic-bezier(0.16, 1, 0.3, 1) backwards;

  &.full-screen {
    @apply rounded-none border-none;

    top: 0;
    left: 0;
    transform: none;
    width: 100%;
    max-width: 100%;
    height: 100%;
    max-height: 100%;
  }

  .dialog-header {
    @apply flex items-start justify-between gap-4 p-6 pb-4 border-b border-(--border-color);

    .header-left {
      @apply flex-1;

      .dialog-title {
        @apply text-xl font-semibold text-(--text-primary) m-0;
      }

      .dialog-description {
        @apply text-sm text-(--text-secondary) mt-1;
      }
    }

    .header-actions {
      @apply flex items-center gap-2;
    }
  }

  .icon-btn {
    @apply w-8 h-8 flex items-center justify-center rounded-lg bg-transparent border-none cursor-pointer text-(--text-tertiary) transition-colors duration-200;

    &:hover {
      @apply bg-(--bg-tertiary) text-(--text-primary);
    }

    svg {
      @apply w-5 h-5;
    }
  }

  .dialog-form {
    @apply flex flex-col flex-1 p-6 pt-4 overflow-hidden;

    .form-field {
      @apply flex flex-col flex-1 min-h-0;

      .prompt-textarea {
        @apply w-full flex-1 px-4 py-3 rounded-lg border border-(--border-color) bg-(--bg-primary) text-(--text-primary) text-sm leading-relaxed resize-none transition-all duration-200;

        min-height: 200px;

        &::placeholder {
          @apply text-(--text-tertiary);
        }

        &:focus {
          @apply outline-none border-(--accent-color) ring-2 ring-(--accent-color)/20;
        }
      }
    }
  }

  .dialog-actions {
    @apply flex justify-end gap-3 mt-4 pt-4 border-t border-(--border-color);

    .btn {
      @apply px-4 py-2 rounded-lg font-medium text-sm cursor-pointer border-none transition-colors duration-200;

      &:disabled {
        @apply opacity-50 cursor-not-allowed;
      }

      &.btn-secondary {
        @apply bg-(--bg-tertiary) text-(--text-primary);

        &:hover:not(:disabled) {
          @apply bg-(--border-color);
        }
      }

      &.btn-primary {
        @apply bg-(--accent-color) text-white;

        &:hover:not(:disabled) {
          @apply bg-(--accent-hover);
        }
      }
    }
  }
}

.full-screen .dialog-form .form-field .prompt-textarea {
  min-height: 100%;
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
