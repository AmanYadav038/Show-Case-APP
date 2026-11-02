import { ref, watch } from 'vue'

const STORAGE_KEY = 'showcase_watchlist'

// Shared reactive state across components
const watchlist = ref(loadWatchlist())

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }
  if (typeof globalThis !== 'undefined' && globalThis.localStorage && typeof globalThis.localStorage.getItem === 'function') {
    return globalThis.localStorage
  }
  return null
}

function loadWatchlist() {
  try {
    const storage = getStorage()
    if (!storage) return []
    const raw = storage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

function saveWatchlist(items) {
  try {
    const storage = getStorage()
    if (!storage) return
    storage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (e) {
    return
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
