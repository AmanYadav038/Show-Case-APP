import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSearch } from '../../src/composables/useSearch.js'
import * as tvmazeApi from '../../src/services/tvmazeApi.js'

describe('useSearch composable', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.restoreAllMocks()
    vi.spyOn(tvmazeApi, 'searchPeople').mockResolvedValue([])
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

  it('executeSearch with scope actors searches people via searchPeople', async () => {
    const mockPeople = [{ id: 1, name: 'Bryan Cranston' }]
    vi.spyOn(tvmazeApi, 'searchPeople').mockResolvedValueOnce(mockPeople)

    const { executeSearch, results, searchScope } = useSearch()
    searchScope.value = 'actors'
    const data = await executeSearch('Bryan Cranston', 'actors')

    expect(data.length).toBe(1)
    expect(data[0].name).toBe('Bryan Cranston')
    expect(data[0].resultType).toBe('person')
    expect(results.value).toEqual(data)
  })

  it('executeSearch with scope all includes both matching actors and shows', async () => {
    const mockShows = [{ id: 101, name: 'Breaking Bad' }]
    const mockPeople = [{ id: 1, name: 'Bryan Cranston' }]
    vi.spyOn(tvmazeApi, 'searchShows').mockResolvedValueOnce(mockShows)
    vi.spyOn(tvmazeApi, 'searchPeople').mockResolvedValueOnce(mockPeople)

    const { executeSearch, results } = useSearch()
    const data = await executeSearch('Bryan', 'all')

    expect(data.some(item => item.resultType === 'person' && item.name === 'Bryan Cranston')).toBe(true)
    expect(data.some(item => item.name === 'Breaking Bad')).toBe(true)
    expect(results.value).toEqual(data)
  })
})
