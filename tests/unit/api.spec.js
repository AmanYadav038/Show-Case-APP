import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchShows, fetchShowDetails, searchShows, clearApiCache } from '../../src/services/tvmazeApi.js'

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

  it('fetchShowDetails retrieves show with embedded details', async () => {
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
  })

  it('searchShows returns formatted show list with searchScore', async () => {
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
  })

  it('searchShows returns empty array for blank query', async () => {
    const results = await searchShows('   ')
    expect(results).toEqual([])
  })
})
