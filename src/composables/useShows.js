import { ref, computed } from 'vue'
import { fetchShows } from '../services/tvmazeApi.js'

// Standard genres we want to present
export const CURATED_GENRES = [
  'Drama',
  'Action',
  'Science-Fiction',
  'Comedy',
  'Thriller',
  'Crime',
  'Anime',
  'Adventure',
  'Mystery',
  'Romance',
  'Supernatural',
  'Horror'
]

// Global shared state for caching across route navigation
const shows = ref([])
const loading = ref(false)
const error = ref(null)
const isLoaded = ref(false)

// Pagination & Lazy-Loading State
const currentPage = ref(0)
const isLoadingMore = ref(false)
const hasMore = ref(true)
const loadMoreError = ref(null)

export function useShows() {
  async function loadShows(force = false) {
    if (isLoaded.value && !force && shows.value.length > 0) {
      return
    }

    loading.value = true
    error.value = null
    currentPage.value = 0
    hasMore.value = true

    try {
      const data = await fetchShows(0)
      shows.value = data
      isLoaded.value = true
    } catch (err) {
      error.value = err.message || 'Unable to load TV shows. Please check your connection and try again.'
    } finally {
      loading.value = false
    }
  }

  // Lazy-load next page of shows for infinite pagination
  async function loadMoreShows() {
    if (isLoadingMore.value || !hasMore.value) {
      return []
    }

    isLoadingMore.value = true
    loadMoreError.value = null
    const nextPage = currentPage.value + 1

    try {
      const nextBatch = await fetchShows(nextPage)
      if (!nextBatch || nextBatch.length === 0) {
        hasMore.value = false
        return []
      }

      // Deduplicate against existing shows
      const existingIds = new Set(shows.value.map(s => s.id))
      const uniqueNew = nextBatch.filter(s => !existingIds.has(s.id))

      shows.value = [...shows.value, ...uniqueNew]
      currentPage.value = nextPage

      return uniqueNew
    } catch (err) {
      // 404 from TVMaze indicates no more pages exist
      if (err.message && err.message.includes('404')) {
        hasMore.value = false
      } else {
        loadMoreError.value = err.message || 'Failed to load more shows.'
      }
      return []
    } finally {
      isLoadingMore.value = false
    }
  }

  /**
   * Load more shows specifically seeking matches for a given genre,
   * without mutating or polluting the global Page 0 `shows` cache.
   * Probes subsequent TVMaze index pages until at least one matching
   * show is found, or until maximum attempts / end of catalog.
   *
   * @param {string} genreName - Target genre (e.g. 'Action', 'Drama', 'Top-Rated')
   * @param {number} fromPage - TVMaze page to start fetching from (defaults to 1)
   * @param {Set<number>|Array<number>} [existingIds] - IDs to deduplicate against
   * @returns {Promise<{ newShows: Array, lastPage: number, hasMore: boolean, length: number, added: number }>}
   */
  async function loadMoreShowsForGenre(genreName, fromPage = 1, existingIds = new Set()) {
    if (isLoadingMore.value) {
      return { newShows: [], lastPage: fromPage, hasMore: true, length: 0, added: 0 }
    }

    isLoadingMore.value = true
    loadMoreError.value = null

    const g = (genreName || '').toLowerCase()
    const collectedShows = []
    let page = fromPage
    let attempts = 0
    const maxAttempts = 3
    let catalogHasMore = true

    // Normalize existing IDs Set
    const knownIds = existingIds instanceof Set 
      ? new Set(existingIds) 
      : new Set(Array.isArray(existingIds) ? existingIds : [])

    // Include Page 0 shows IDs to avoid any duplicate across pages
    shows.value.forEach(s => knownIds.add(s.id))

    try {
      while (attempts < maxAttempts && catalogHasMore) {
        attempts++
        let nextBatch = []

        try {
          nextBatch = await fetchShows(page)
        } catch (err) {
          // 404 from TVMaze indicates no more pages exist in the catalog
          if (err.message && (err.message.includes('404') || err.message.includes('not found'))) {
            catalogHasMore = false
            break
          }
          throw err
        }

        if (!nextBatch || nextBatch.length === 0) {
          catalogHasMore = false
          break
        }

        // Filter ONLY shows that match this specific genre
        let matchingBatch = []
        if (g === 'top-rated') {
          matchingBatch = nextBatch.filter(s => s.rating?.average >= 7.8)
        } else {
          matchingBatch = nextBatch.filter(s =>
            Array.isArray(s.genres) && s.genres.some(item => item.toLowerCase() === g)
          )
        }

        // Deduplicate against known shows
        const uniqueMatching = matchingBatch.filter(s => !knownIds.has(s.id))
        uniqueMatching.forEach(s => knownIds.add(s.id))
        collectedShows.push(...uniqueMatching)

        // Stop probing further once we have found matching shows for this genre
        if (collectedShows.length > 0) {
          break
        }

        page++
      }

      return {
        newShows: collectedShows,
        lastPage: page,
        hasMore: catalogHasMore,
        length: collectedShows.length,
        added: collectedShows.length
      }
    } catch (err) {
      loadMoreError.value = err.message || 'Failed to load more shows for this genre.'
      return {
        newShows: collectedShows,
        lastPage: page,
        hasMore: catalogHasMore,
        length: collectedShows.length,
        added: collectedShows.length
      }
    } finally {
      isLoadingMore.value = false
    }
  }

  // Helper to sort shows by rating (primary) and weight/popularity (secondary)
  function sortShowsByPopularity(showList) {
    return [...showList].sort((a, b) => {
      const ratingA = a.rating?.average ?? 0
      const ratingB = b.rating?.average ?? 0
      if (ratingB !== ratingA) {
        return ratingB - ratingA
      }
      return (b.weight ?? 0) - (a.weight ?? 0)
    })
  }

  // Popular / Highest-rated across all categories (Top 10)
  const topRatedShows = computed(() => {
    const filtered = shows.value.filter(s => s.rating?.average && s.image?.medium)
    return sortShowsByPopularity(filtered).slice(0, 10)
  })

  // Top 5 spotlight shows for the Hero Banner
  const featuredShows = computed(() => {
    return topRatedShows.value.filter(s => s.summary && s.image?.original).slice(0, 5)
  })

  // Shows grouped by curated genres, each limited to 10 shows and sorted by rating descending
  const genreLists = computed(() => {
    const lists = {}

    for (const genre of CURATED_GENRES) {
      const matching = shows.value.filter(show => 
        Array.isArray(show.genres) && show.genres.includes(genre)
      )
      if (matching.length > 0) {
        lists[genre] = sortShowsByPopularity(matching).slice(0, 10)
      }
    }

    return lists
  })

  // Available genre names with counts
  const availableGenres = computed(() => {
    return Object.keys(genreLists.value).map(genre => ({
      name: genre,
      count: genreLists.value[genre].length
    }))
  })

  function getShowsByGenre(genre) {
    return genreLists.value[genre] || []
  }

  return {
    shows,
    loading,
    error,
    isLoaded,
    currentPage,
    isLoadingMore,
    hasMore,
    loadMoreError,
    loadShows,
    loadMoreShows,
    loadMoreShowsForGenre,
    topRatedShows,
    featuredShows,
    genreLists,
    availableGenres,
    getShowsByGenre
  }
}
