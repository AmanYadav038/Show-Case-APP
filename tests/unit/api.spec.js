import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchShows,
  fetchShowDetails,
  searchShows,
  searchPeople,
  fetchPersonCastCredits,
  clearApiCache
} from '../../src/services/tvmazeApi.js'

describe('tvmazeApi service', () => {
  beforeEach(() => {
    clearApiCache()
    vi.restoreAllMocks()
  })

  it('fetchShows retrieves list and caches the result for page 0', async () => {
    const mockShows = [
      { id: 1, name: 'Under the Dome', rating: { average: 6.5 } },
      { id: 2, name: 'Person of Interest', rating: { average: 8.8 } }
    ]

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockShows
    })

    const result1 = await fetchShows(0)
    expect(result1).toEqual(mockShows)
    expect(fetchSpy).toHaveBeenCalledTimes(1)

    // Second call should come from cache
    const result2 = await fetchShows(0)
    expect(result2).toEqual(mockShows)
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('fetchShows throws error when network response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    })

    await expect(fetchShows(0)).rejects.toThrow('TVMaze API error: 500')
  })

  it('fetchShowDetails retrieves show with embedded details and caches it', async () => {
    const mockShow = {
      id: 1,
      name: 'Under the Dome',
      _embedded: { cast: [], episodes: [] }
    }

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockShow
    })

    const result = await fetchShowDetails(1)
    expect(result.id).toBe(1)
    expect(fetchSpy).toHaveBeenCalledWith('https://api.tvmaze.com/shows/1?embed[]=cast&embed[]=episodes')

    // Second call comes from cache
    const cachedResult = await fetchShowDetails(1)
    expect(cachedResult.id).toBe(1)
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('fetchShowDetails handles 404 not found specifically', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    })

    await expect(fetchShowDetails(999999)).rejects.toThrow('TV Show not found')
  })

  it('fetchShowDetails handles generic HTTP error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway'
    })

    await expect(fetchShowDetails(123)).rejects.toThrow('TVMaze API error: 502')
  })

  it('searchShows returns formatted show list with searchScore and caches it', async () => {
    const mockResponse = [
      { score: 17.5, show: { id: 169, name: 'Breaking Bad' } }
    ]

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    const results = await searchShows('Breaking Bad')
    expect(results.length).toBe(1)
    expect(results[0].name).toBe('Breaking Bad')
    expect(results[0].searchScore).toBe(17.5)

    // Second search should come from cache
    const cachedResults = await searchShows('Breaking Bad')
    expect(cachedResults.length).toBe(1)
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('searchShows throws error when search response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Server Error'
    })

    await expect(searchShows('crash')).rejects.toThrow('TVMaze search error: 500')
  })

  it('searchShows returns empty array for blank query', async () => {
    const results = await searchShows('   ')
    expect(results).toEqual([])
  })

  it('searchPeople searches actors and formats results with resultType person', async () => {
    const mockPeopleResponse = [
      { score: 14.2, person: { id: 1, name: 'Bryan Cranston', country: { name: 'United States' } } }
    ]

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockPeopleResponse
    })

    const results = await searchPeople('Bryan Cranston')
    expect(results.length).toBe(1)
    expect(results[0].name).toBe('Bryan Cranston')
    expect(results[0].resultType).toBe('person')
    expect(results[0].searchScore).toBe(14.2)
    expect(fetchSpy).toHaveBeenCalledWith('https://api.tvmaze.com/search/people?q=Bryan%20Cranston')

    // Second call cached
    const cached = await searchPeople('Bryan Cranston')
    expect(cached.length).toBe(1)
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('fetchPersonCastCredits retrieves embedded shows and deduplicates', async () => {
    const mockCreditsResponse = [
      {
        _embedded: {
          show: { id: 169, name: 'Breaking Bad', rating: { average: 9.5 } }
        }
      },
      {
        _embedded: {
          show: { id: 169, name: 'Breaking Bad', rating: { average: 9.5 } } // Duplicate credit for different season/role
        }
      },
      {
        _embedded: {
          show: { id: 1445, name: 'Your Honor', rating: { average: 8.1 } }
        }
      }
    ]

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockCreditsResponse
    })

    const shows = await fetchPersonCastCredits(1)
    expect(shows.length).toBe(2) // Deduplicated from 3 credits
    expect(shows[0].name).toBe('Breaking Bad')
    expect(shows[1].name).toBe('Your Honor')
    expect(fetchSpy).toHaveBeenCalledWith('https://api.tvmaze.com/people/1/castcredits?embed=show')

    // Cached on second call
    const cached = await fetchPersonCastCredits(1)
    expect(cached.length).toBe(2)
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })
})
