import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSearch } from '../../src/composables/useSearch.js'
import * as tvmazeApi from '../../src/services/tvmazeApi.js'

describe('useSearch composable', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.restoreAllMocks()
  })

  it('initializes with empty query and results', () => {
    const { query, results, isSearching } = useSearch()
    expect(query.value).toBe('')
    expect(results.value).toEqual([])
    expect(isSearching.value).toBe(false)
  })

  it('executeSearch performs search and updates results', async () => {
    const mockResults = [{ id: 101, name: 'Breaking Bad' }]
    vi.spyOn(tvmazeApi, 'searchShows').mockResolvedValueOnce(mockResults)

    const { executeSearch, results, isSearching } = useSearch()
    const searchPromise = executeSearch('Breaking')

    expect(isSearching.value).toBe(true)
    const data = await searchPromise

    expect(isSearching.value).toBe(false)
    expect(data).toEqual(mockResults)
    expect(results.value).toEqual(mockResults)
  })

  it('executeSearch returns empty array for blank query', async () => {
    const { executeSearch, results } = useSearch()
    const data = await executeSearch('   ')
    expect(data).toEqual([])
    expect(results.value).toEqual([])
  })

  it('handleInput clears results when input is empty string', () => {
    const { handleInput, results, query } = useSearch()
    results.value = [{ id: 1 }]

    handleInput('')
    expect(query.value).toBe('')
    expect(results.value).toEqual([])
  })

  it('clearSearch resets all search state', () => {
    const { query, results, isSearching, searchError, clearSearch } = useSearch()
    query.value = 'abc'
    results.value = [{ id: 1 }]
    isSearching.value = true
    searchError.value = 'some error'

    clearSearch()
    expect(query.value).toBe('')
    expect(results.value).toEqual([])
    expect(isSearching.value).toBe(false)
    expect(searchError.value).toBe(null)
  })
})
