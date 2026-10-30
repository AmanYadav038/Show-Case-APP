import { ref, computed } from 'vue'
import { fetchShows } from '../services/tvmazeApi.js'

// Standard genres we want to present on the dashboard
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

export function useShows() {
  async function loadShows(force = false) {
    if (isLoaded.value && !force && shows.value.length > 0) {
      return
    }

    loading.value = true
    error.value = null

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

  // Popular / Highest-rated across all categories
  const topRatedShows = computed(() => {
    const filtered = shows.value.filter(s => s.rating?.average && s.image?.medium)
    return sortShowsByPopularity(filtered).slice(0, 20)
  })

  // Top 5 spotlight shows for the Hero Banner
  const featuredShows = computed(() => {
    return topRatedShows.value.filter(s => s.summary && s.image?.original).slice(0, 5)
  })

  // Shows grouped by curated genres, each sorted by rating descending
  const genreLists = computed(() => {
    const lists = {}

    for (const genre of CURATED_GENRES) {
      const matching = shows.value.filter(show => 
        Array.isArray(show.genres) && show.genres.includes(genre)
      )
      if (matching.length > 0) {
        lists[genre] = sortShowsByPopularity(matching)
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
    loadShows,
    topRatedShows,
    featuredShows,
    genreLists,
    availableGenres,
    getShowsByGenre
  }
}
