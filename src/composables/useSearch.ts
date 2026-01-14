import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  promptService,
  type PromptSearchResult,
} from '@app/shared/services/prompt.service';

const searchQuery = ref('');
const searchResults = ref<PromptSearchResult[]>([]);
const isDropdownOpen = ref(false);
const isLoading = ref(false);

let searchTimeout: number | null = null;

export function useSearch() {
  const router = useRouter();

  const hasQuery = computed(() => searchQuery.value.trim().length > 0);

  const fetchResults = async () => {
    isLoading.value = true;
    try {
      searchResults.value = await promptService.search(searchQuery.value, 10);
    } catch (e) {
      console.error('Failed to search prompts:', e);
      searchResults.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const handleSearchInput = () => {
    if (searchTimeout) {
      window.clearTimeout(searchTimeout);
    }

    searchTimeout = window.setTimeout(() => {
      fetchResults();
    }, 200);
  };

  const openDropdown = () => {
    isDropdownOpen.value = true;
    if (searchResults.value.length === 0) {
      fetchResults();
    }
  };

  const closeDropdown = () => {
    isDropdownOpen.value = false;
  };

  const clearSearch = () => {
    searchQuery.value = '';
    searchResults.value = [];
    isDropdownOpen.value = false;
  };

  const navigateToPrompt = (prompt: PromptSearchResult) => {
    isDropdownOpen.value = false;
    router.push({
      path: `/project/${prompt.projectId}/prompts`,
      query: {
        featureId: String(prompt.featureId),
        search: searchQuery.value || undefined,
      },
    });
  };

  return {
    searchQuery,
    searchResults,
    isDropdownOpen,
    isLoading,
    hasQuery,
    handleSearchInput,
    openDropdown,
    closeDropdown,
    clearSearch,
    navigateToPrompt,
    fetchResults,
  };
}
