import { ref } from 'vue'
import { searchShows } from '../services/tvmazeApi.js'

export function useSearch() {
  const query = ref('')
  const results = ref([])
  const isSearching = ref(false)
  const searchError = ref(null)
  let debounceTimer = null

  async function executeSearch(searchText) {
    const trimmed = (searchText ?? query.value).trim()
    if (!trimmed) {
      results.value = []
      isSearching.value = false
      searchError.value = null
      return []
    }

    isSearching.value = true
    searchError.value = null

    try {
      const data = await searchShows(trimmed)
      results.value = data
      return data
    } catch (err) {
      searchError.value = err.message || 'Error occurred while searching.'
      results.value = []
      return []
    } finally {
      isSearching.value = false
    }
  }

  function handleInput(val, delay = 280) {
    query.value = val
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    if (!val || val.trim().length === 0) {
      results.value = []
      isSearching.value = false
      return
    }

    debounceTimer = setTimeout(() => {
      executeSearch(val)
    }, delay)
  }

  function clearSearch() {
    query.value = ''
    results.value = []
    isSearching.value = false
    searchError.value = null
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
  }

  return {
    query,
    results,
    isSearching,
    searchError,
    executeSearch,
    handleInput,
    clearSearch
  }
}
