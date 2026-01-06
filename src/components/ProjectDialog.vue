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
          {{ isEditMode ? 'Edit Project' : 'Create New Project' }}
        </DialogTitle>
        <DialogDescription class="dialog-description">
          {{ isEditMode ? 'Update the project details below.' : 'Fill in the details to create a new project.' }}
        </DialogDescription>

        <form class="dialog-form" @submit.prevent="handleSubmit">
          <div class="form-field">
            <label for="project-name" class="form-label">Name</label>
            <input
              id="project-name"
              v-model="formData.name"
              type="text"
              class="form-input"
              placeholder="Enter project name"
              required
            />
          </div>

          <div class="form-field">
            <label for="project-icon" class="form-label">Icon</label>
            <input
              id="project-icon"
              v-model="formData.icon"
              type="text"
              class="form-input"
              placeholder="Enter an emoji (e.g. 📁)"
              maxlength="2"
            />
          </div>

          <div class="form-field">
            <label for="project-description" class="form-label">Description</label>
            <textarea
              id="project-description"
              v-model="formData.description"
              class="form-textarea"
              placeholder="Enter project description (optional)"
              rows="3"
            />
          </div>

          <div class="dialog-actions">
            <DialogClose as-child>
              <button type="button" class="btn btn-secondary">Cancel</button>
            </DialogClose>
            <button type="submit" class="btn btn-primary">
              {{ isEditMode ? 'Save Changes' : 'Create Project' }}
            </button>
          </div>
        </form>

        <DialogClose as-child>
          <button class="dialog-close-icon" aria-label="Close">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
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

export interface ProjectFormData {
  id?: string;
  name: string;
  icon: string;
  description: string;
}

interface Props {
  project?: ProjectFormData;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  submit: [data: ProjectFormData];
}>();

const isOpen = ref(false);

const isEditMode = computed(() => !!props.project?.id);

const getDefaultFormData = (): ProjectFormData => ({
  id: props.project?.id,
  name: props.project?.name ?? '',
  icon: props.project?.icon ?? '📁',
  description: props.project?.description ?? '',
});

const formData = reactive<ProjectFormData>(getDefaultFormData());

watch(
  () => props.project,
  () => {
    Object.assign(formData, getDefaultFormData());
  },
  { deep: true }
);

watch(isOpen, (open) => {
  if (open) {
    Object.assign(formData, getDefaultFormData());
  }
});

const handleSubmit = () => {
  if (!formData.name.trim()) return;

  emit('submit', { ...formData });
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

      .form-input,
      .form-textarea {
        @apply w-full px-3 py-2 rounded-lg border border-(--border-color) bg-(--bg-primary) text-(--text-primary) text-sm transition-all duration-200;

        &::placeholder {
          @apply text-(--text-tertiary);
        }

        &:focus {
          @apply outline-none border-(--accent-color) ring-2 ring-(--accent-color)/20;
        }
      }

      .form-textarea {
        @apply resize-none;
      }
    }
  }

  .dialog-actions {
    @apply flex justify-end gap-3 mt-6;

    .btn {
      @apply px-4 py-2 rounded-lg font-medium text-sm cursor-pointer border-none transition-colors duration-200;

      &.btn-secondary {
        @apply bg-(--bg-tertiary) text-(--text-primary);

        &:hover {
          @apply bg-(--border-color);
        }
      }

      &.btn-primary {
        @apply bg-(--accent-color) text-white;

        &:hover {
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
