import { ref } from 'vue'
import { searchShows, searchPeople } from '../services/tvmazeApi.js'
import { ALL_TVMAZE_GENRES, useShows } from './useShows.js'

export function useSearch() {
  const query = ref('')
  const results = ref([])
  const isSearching = ref(false)
  const searchError = ref(null)
  const searchScope = ref('all') // 'all' | 'shows' | 'actors' | 'genres'
  let debounceTimer = null

  async function executeSearch(searchText, scope = searchScope.value) {
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
      let data = []
      if (scope === 'actors') {
        const people = await searchPeople(trimmed)
        data = people.map(p => ({
          ...p,
          resultType: 'person'
        }))
      } else if (scope === 'genres') {
        const lower = trimmed.toLowerCase()
        const matchedGenres = ALL_TVMAZE_GENRES.filter(g => g.toLowerCase().includes(lower))

        // Query in-memory catalog for any shows tagged with this genre
        const { shows: inMemoryShows } = useShows()
        const catalogGenreShows = (inMemoryShows.value || []).filter(s =>
          Array.isArray(s.genres) && s.genres.some(g => g.toLowerCase().includes(lower))
        )

        const apiShows = await searchShows(trimmed)
        const apiGenreShows = apiShows.filter(s =>
          Array.isArray(s.genres) && s.genres.some(g => g.toLowerCase().includes(lower))
        )

        // Merge deduplicated genre shows
        const mergedMap = new Map()
        catalogGenreShows.forEach(s => mergedMap.set(s.id, s))
        apiGenreShows.forEach(s => mergedMap.set(s.id, s))
        if (mergedMap.size === 0) {
          apiShows.forEach(s => mergedMap.set(s.id, s))
        }

        const genreItems = matchedGenres.map(g => ({
          id: `genre-${g}`,
          name: `Explore all ${g} TV Shows`,
          genreName: g,
          resultType: 'genre'
        }))
        data = [...genreItems, ...Array.from(mergedMap.values())]
      } else if (scope === 'shows') {
        data = await searchShows(trimmed)
      } else {
        // 'all'
        const shows = await searchShows(trimmed)
        let people = []
        try {
          const peopleRes = await searchPeople(trimmed)
          people = (peopleRes || []).slice(0, 3).map(p => ({
            ...p,
            resultType: 'person'
          }))
        } catch (e) {
          people = []
        }

        const lower = trimmed.toLowerCase()
        const matchedGenre = ALL_TVMAZE_GENRES.find(g =>
          g.toLowerCase() === lower || g.toLowerCase().startsWith(lower) || g.toLowerCase().includes(lower)
        )

        // If a genre matches, also fetch matching shows from in-memory catalog
        let catalogGenreShows = []
        if (matchedGenre) {
          const { shows: inMemoryShows } = useShows()
          catalogGenreShows = (inMemoryShows.value || []).filter(s =>
            Array.isArray(s.genres) && s.genres.some(g => g.toLowerCase() === matchedGenre.toLowerCase())
          ).slice(0, 4)
        }

        const genreItems = matchedGenre ? [{
          id: `genre-${matchedGenre}`,
          name: `Explore all ${matchedGenre} TV Shows`,
          genreName: matchedGenre,
          resultType: 'genre'
        }] : []

        const mergedMap = new Map()
        catalogGenreShows.forEach(s => mergedMap.set(s.id, s))
        shows.forEach(s => mergedMap.set(s.id, s))

        data = [...genreItems, ...people, ...Array.from(mergedMap.values())]
      }

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

  function setScope(newScope) {
    searchScope.value = newScope
    if (query.value.trim()) {
      executeSearch(query.value, newScope)
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
      executeSearch(val, searchScope.value)
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
    searchScope,
    setScope,
    executeSearch,
    handleInput,
    clearSearch
  }
}
