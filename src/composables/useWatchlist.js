import { ref, watch } from 'vue'

const STORAGE_KEY = 'cinemaze_watchlist'

// Shared reactive state across components
const watchlist = ref(loadWatchlist())

function loadWatchlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.warn('Failed to read watchlist from localStorage', e)
    return []
  }
}

function saveWatchlist(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (e) {
    console.warn('Failed to save watchlist to localStorage', e)
  }
}

watch(watchlist, (items) => {
  saveWatchlist(items)
}, { deep: true })

export function useWatchlist() {
  function isInWatchlist(id) {
    const numId = Number(id)
    return watchlist.value.some(item => Number(item.id) === numId)
  }

  function toggleWatchlist(show) {
    if (!show || !show.id) return
    const numId = Number(show.id)
    const index = watchlist.value.findIndex(item => Number(item.id) === numId)
    
    if (index >= 0) {
      watchlist.value.splice(index, 1)
      return false
    } else {
      watchlist.value.push({
        id: show.id,
        name: show.name,
        rating: show.rating,
        genres: show.genres,
        premiered: show.premiered,
        ended: show.ended,
        image: show.image,
        summary: show.summary
      })
      return true
    }
  }

  return {
    watchlist,
    isInWatchlist,
    toggleWatchlist
  }
}
