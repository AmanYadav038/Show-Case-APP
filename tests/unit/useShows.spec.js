import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useShows, CURATED_GENRES } from '../../src/composables/useShows.js'
import * as tvmazeApi from '../../src/services/tvmazeApi.js'

describe('useShows composable', () => {
  const mockShowsData = [
    {
      id: 1,
      name: 'Show High',
      rating: { average: 9.5 },
      weight: 100,
      image: { medium: 'http://img.com/1m.jpg', original: 'http://img.com/1o.jpg' },
      genres: ['Drama', 'Action'],
      summary: 'High rated drama action show'
    },
    {
      id: 2,
      name: 'Show Mid',
      rating: { average: 8.0 },
      weight: 80,
      image: { medium: 'http://img.com/2m.jpg', original: 'http://img.com/2o.jpg' },
      genres: ['Drama'],
      summary: 'Mid rated drama show'
    },
    {
      id: 3,
      name: 'Show Low',
      rating: { average: 7.0 },
      weight: 60,
      image: { medium: 'http://img.com/3m.jpg' },
      genres: ['Comedy'],
      summary: 'Comedy show'
    }
  ]

  beforeEach(() => {
    vi.restoreAllMocks()
    const { shows, isLoaded } = useShows()
    shows.value = []
    isLoaded.value = false
  })

  it('CURATED_GENRES exports an array of expected genres', () => {
    expect(CURATED_GENRES).toContain('Drama')
    expect(CURATED_GENRES).toContain('Action')
    expect(CURATED_GENRES).toContain('Comedy')
  })

  it('loadShows fetches data from tvmazeApi and updates reactive state', async () => {
    vi.spyOn(tvmazeApi, 'fetchShows').mockResolvedValueOnce(mockShowsData)

    const { shows, loading, isLoaded, loadShows, topRatedShows, genreLists } = useShows()

    expect(isLoaded.value).toBe(false)
    await loadShows(true)

    expect(isLoaded.value).toBe(true)
    expect(loading.value).toBe(false)
    expect(shows.value.length).toBe(3)
    expect(topRatedShows.value.length).toBe(3)
    expect(topRatedShows.value[0].name).toBe('Show High')
    expect(genreLists.value['Drama'].length).toBe(2)
    expect(genreLists.value['Comedy'].length).toBe(1)
  })

  it('loadShows sets error state when fetch fails', async () => {
    vi.spyOn(tvmazeApi, 'fetchShows').mockRejectedValueOnce(new Error('Network offline'))

    const { loading, error, loadShows } = useShows()
    await loadShows(true)

    expect(loading.value).toBe(false)
    expect(error.value).toBe('Network offline')
  })

  it('featuredShows extracts top shows with summary and original image', async () => {
    vi.spyOn(tvmazeApi, 'fetchShows').mockResolvedValueOnce(mockShowsData)
    const { loadShows, featuredShows } = useShows()

    await loadShows(true)
    expect(featuredShows.value.length).toBe(2)
    expect(featuredShows.value[0].name).toBe('Show High')
  })

  it('getShowsByGenre returns matching array or empty array if not found', async () => {
    vi.spyOn(tvmazeApi, 'fetchShows').mockResolvedValueOnce(mockShowsData)
    const { loadShows, getShowsByGenre } = useShows()

    await loadShows(true)
    expect(getShowsByGenre('Drama').length).toBe(2)
    expect(getShowsByGenre('NonExistentGenre')).toEqual([])
  })

  it('availableGenres lists genres with counts', async () => {
    vi.spyOn(tvmazeApi, 'fetchShows').mockResolvedValueOnce(mockShowsData)
    const { loadShows, availableGenres } = useShows()

    await loadShows(true)
    const drama = availableGenres.value.find(g => g.name === 'Drama')
    expect(drama).toBeDefined()
    expect(drama.count).toBe(2)
  })
})
