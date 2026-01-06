<template>
  <DialogRoot v-model:open="isOpen">
    <DialogTrigger as-child>
      <slot name="trigger" />
    </DialogTrigger>

    <DialogPortal>
      <DialogOverlay class="dialog-overlay" />
      <DialogContent
        class="dialog-content"
        @escape-key-down.prevent
        @interact-outside.prevent
      >
        <DialogTitle class="dialog-title">
          {{ isEditMode ? 'Edit Feature' : 'Create New Feature' }}
        </DialogTitle>
        <DialogDescription class="dialog-description">
          {{
            isEditMode
              ? 'Update the feature name below.'
              : 'Enter a name for the new feature.'
          }}
        </DialogDescription>

        <form class="dialog-form" @submit.prevent="handleSubmit">
          <div class="form-field">
            <label for="feature-name" class="form-label">Name</label>
            <input
              id="feature-name"
              ref="inputRef"
              v-model="featureName"
              type="text"
              class="form-input"
              placeholder="Enter feature name"
              required
            />
          </div>

          <div class="dialog-actions">
            <DialogClose as-child>
              <button type="button" class="btn btn-secondary">Cancel</button>
            </DialogClose>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="!featureName.trim()"
            >
              {{ isEditMode ? 'Save Changes' : 'Create Feature' }}
            </button>
          </div>
        </form>

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
import type { Feature } from '@app/shared/models';

interface Props {
  feature?: Feature;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  submit: [name: string, featureId?: number];
}>();

const isOpen = ref(false);
const featureName = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

const isEditMode = props.feature !== undefined;

watch(isOpen, async open => {
  if (open) {
    featureName.value = props.feature?.name ?? '';
    await nextTick();
    inputRef.value?.focus();
  }
});

watch(
  () => props.feature,
  newFeature => {
    if (isOpen.value && newFeature) {
      featureName.value = newFeature.name;
    }
  },
  { deep: true }
);

const handleSubmit = () => {
  if (!featureName.value.trim()) return;

  emit('submit', featureName.value.trim(), props.feature?.id);
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

  .dialog-form {
    @apply flex flex-col gap-4;

    .form-field {
      @apply flex flex-col gap-1.5;

      .form-label {
        @apply text-sm font-medium text-(--text-primary);
      }

      .form-input {
        @apply w-full px-3 py-2 rounded-lg border border-(--border-color) bg-(--bg-primary) text-(--text-primary) text-sm transition-all duration-200;

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
    @apply flex justify-end gap-3 mt-6;

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
