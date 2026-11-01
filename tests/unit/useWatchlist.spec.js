import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { useWatchlist } from '../../src/composables/useWatchlist.js'

// In-memory mock storage
const storageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val) },
    clear: () => { store = {} },
    removeItem: (key) => { delete store[key] }
  }
})()

beforeAll(() => {
  if (typeof window !== 'undefined' && !window.localStorage) {
    Object.defineProperty(window, 'localStorage', { value: storageMock, writable: true })
  }
  if (typeof globalThis !== 'undefined' && (!globalThis.localStorage || typeof globalThis.localStorage.clear !== 'function')) {
    Object.defineProperty(globalThis, 'localStorage', {
      value: typeof window !== 'undefined' && window.localStorage ? window.localStorage : storageMock,
      writable: true,
      configurable: true
    })
  }
})

describe('useWatchlist composable', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.clear === 'function') {
      window.localStorage.clear()
    } else if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.clear === 'function') {
      localStorage.clear()
    }
    const { watchlist } = useWatchlist()
    watchlist.value = []
  })

  it('adds a show to watchlist if not present', () => {
    const { watchlist, isInWatchlist, toggleWatchlist } = useWatchlist()
    const show = {
      id: 101,
      name: 'Under the Dome',
      rating: { average: 6.5 },
      genres: ['Drama', 'Sci-Fi']
    }

    expect(isInWatchlist(101)).toBe(false)
    const added = toggleWatchlist(show)
    expect(added).toBe(true)
    expect(isInWatchlist(101)).toBe(true)
    expect(watchlist.value.length).toBe(1)
  })

  it('removes a show from watchlist if already present', () => {
    const { watchlist, isInWatchlist, toggleWatchlist } = useWatchlist()
    const show = { id: 102, name: 'Person of Interest' }

    toggleWatchlist(show)
    expect(isInWatchlist(102)).toBe(true)

    const addedSecondTime = toggleWatchlist(show)
    expect(addedSecondTime).toBe(false)
    expect(isInWatchlist(102)).toBe(false)
    expect(watchlist.value.length).toBe(0)
  })
})
