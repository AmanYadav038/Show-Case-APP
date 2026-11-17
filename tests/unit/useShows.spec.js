import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useShows, CURATED_GENRES, ALL_TVMAZE_GENRES } from '../../src/composables/useShows.js'
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

  it('ALL_TVMAZE_GENRES exports all 28 genres including Western, Fantasy, War', () => {
    expect(ALL_TVMAZE_GENRES.length).toBe(28)
    expect(ALL_TVMAZE_GENRES).toContain('Western')
    expect(ALL_TVMAZE_GENRES).toContain('Fantasy')
    expect(ALL_TVMAZE_GENRES).toContain('War')
    expect(ALL_TVMAZE_GENRES).toContain('History')
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

  it('loadMoreShows fetches next page and appends to shows', async () => {
    vi.spyOn(tvmazeApi, 'fetchShows')
      .mockResolvedValueOnce(mockShowsData)
      .mockResolvedValueOnce([
        { id: 4, name: 'Show Page 2', rating: { average: 8.5 }, genres: ['Drama'] }
      ])

    const { loadShows, loadMoreShows, shows, currentPage, hasMore } = useShows()
    await loadShows(true)
    expect(shows.value.length).toBe(3)
    expect(currentPage.value).toBe(0)

    await loadMoreShows()
    expect(shows.value.length).toBe(4)
    expect(currentPage.value).toBe(1)
    expect(shows.value[3].name).toBe('Show Page 2')
    expect(hasMore.value).toBe(true) // Has more continues as catalog has subsequent pages
  })

  it('loadMoreShows sets hasMore to false when next page is empty', async () => {
    vi.spyOn(tvmazeApi, 'fetchShows')
      .mockResolvedValueOnce(mockShowsData)
      .mockResolvedValueOnce([])

    const { loadShows, loadMoreShows, hasMore } = useShows()
    await loadShows(true)
    expect(hasMore.value).toBe(true)

    await loadMoreShows()
    expect(hasMore.value).toBe(false)
  })

  it('loadMoreShowsForGenre can be called multiple times across consecutive pages without polluting global shows', async () => {
    vi.spyOn(tvmazeApi, 'fetchShows')
      .mockResolvedValueOnce(mockShowsData)
      .mockResolvedValueOnce([
        { id: 4, name: 'Action P1', rating: { average: 8.8 }, genres: ['Action'] }
      ])
      .mockResolvedValueOnce([
        { id: 5, name: 'Action P2', rating: { average: 8.2 }, genres: ['Action'] }
      ])

    const { loadShows, loadMoreShowsForGenre, shows } = useShows()
    await loadShows(true)
    expect(shows.value.length).toBe(3) // Page 0 shows strictly

    // First load: loads page 1
    const res1 = await loadMoreShowsForGenre('Action', 1)
    expect(res1.newShows.length).toBe(1)
    expect(res1.lastPage).toBe(1)
    expect(res1.hasMore).toBe(true)
    expect(shows.value.length).toBe(3) // Untouched!

    // Second load: loads page 2
    const res2 = await loadMoreShowsForGenre('Action', 2)
    expect(res2.newShows.length).toBe(1)
    expect(res2.lastPage).toBe(2)
    expect(res2.hasMore).toBe(true)
    expect(shows.value.length).toBe(3) // Untouched!
  })

  it('loadMoreShowsForGenre extracts only matching genre shows and keeps global shows cache strictly on page 0', async () => {
    vi.spyOn(tvmazeApi, 'fetchShows')
      .mockResolvedValueOnce(mockShowsData)
      .mockResolvedValueOnce([
        { id: 4, name: 'Show Action Next', rating: { average: 8.8 }, genres: ['Action', 'Thriller'] },
        { id: 5, name: 'Show Comedy Next', rating: { average: 7.2 }, genres: ['Comedy'] }
      ])

    const { loadShows, loadMoreShowsForGenre, shows } = useShows()
    await loadShows(true)
    expect(shows.value.length).toBe(3)

    const { newShows } = await loadMoreShowsForGenre('Action', 1)
    expect(newShows.length).toBe(1)
    expect(newShows[0].name).toBe('Show Action Next')
    // Global shows.value is NOT contaminated with other genre shows
    expect(shows.value.length).toBe(3)
  })

  it('loadMoreShowsForGenre handles 404 end-of-catalog gracefully', async () => {
    vi.spyOn(tvmazeApi, 'fetchShows')
      .mockResolvedValueOnce(mockShowsData)
      .mockRejectedValueOnce(new Error('TVMaze API error: 404 Not Found'))

    const { loadShows, loadMoreShowsForGenre } = useShows()
    await loadShows(true)

    const res = await loadMoreShowsForGenre('Action', 1)
    expect(res.newShows.length).toBe(0)
    expect(res.hasMore).toBe(false)
  })
})
