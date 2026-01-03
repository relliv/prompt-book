import { ref } from 'vue';

export interface Toast {
  id: number;
  title?: string;
  description: string;
  type?: 'success' | 'error' | 'info';
}

const toasts = ref<Toast[]>([]);
let toastId = 0;

export function useToast() {
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = ++toastId;
    toasts.value.push({ ...toast, id });
    return id;
  };

  const removeToast = (id: number) => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  };

  const success = (description: string, title?: string) => {
    return addToast({ description, title, type: 'success' });
  };

  const error = (description: string, title?: string) => {
    return addToast({ description, title, type: 'error' });
  };

  const info = (description: string, title?: string) => {
    return addToast({ description, title, type: 'info' });
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
  };
}
