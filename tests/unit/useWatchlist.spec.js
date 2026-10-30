import { describe, it, expect, beforeEach } from 'vitest'
import { useWatchlist } from '../../src/composables/useWatchlist.js'

describe('useWatchlist composable', () => {
  beforeEach(() => {
    localStorage.clear()
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
