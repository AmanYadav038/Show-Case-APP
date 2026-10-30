const BASE_URL = 'https://api.tvmaze.com'

// In-memory cache to prevent redundant network calls during navigation
const cache = {
  shows: null,
  showsPromise: null,
  showDetails: new Map(),
  searchResults: new Map()
}

/**
 * Fetch a list of shows from TVMaze index.
 * Caches the response in memory for snappy navigation.
 * @param {number} page - Page index (0 = first 250 shows)
 * @returns {Promise<Array>}
 */
export async function fetchShows(page = 0) {
  if (cache.shows && page === 0) {
    return cache.shows
  }

  if (cache.showsPromise && page === 0) {
    return cache.showsPromise
  }

  const promise = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/shows?page=${page}`)
      if (!response.ok) {
        throw new Error(`TVMaze API error: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      if (page === 0) {
        cache.shows = data
      }
      return data
    } catch (error) {
      console.error('Failed to fetch shows:', error)
      throw error
    } finally {
      if (page === 0) {
        cache.showsPromise = null
      }
    }
  })()

  if (page === 0) {
    cache.showsPromise = promise
  }

  return promise
}

/**
 * Fetch detailed show information including cast and episodes via TVMaze embeds.
 * @param {number|string} id - TV show ID
 * @returns {Promise<Object>}
 */
export async function fetchShowDetails(id) {
  const numericId = Number(id)
  if (cache.showDetails.has(numericId)) {
    return cache.showDetails.get(numericId)
  }

  try {
    const response = await fetch(`${BASE_URL}/shows/${numericId}?embed[]=cast&embed[]=episodes`)
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('TV Show not found')
      }
      throw new Error(`TVMaze API error: ${response.status} ${response.statusText}`)
    }
    const data = await response.json()
    cache.showDetails.set(numericId, data)
    return data
  } catch (error) {
    console.error(`Failed to fetch show details for ID ${id}:`, error)
    throw error
  }
}

/**
 * Search shows by query string.
 * @param {string} query
 * @returns {Promise<Array>} Array of { score, show }
 */
export async function searchShows(query) {
  const trimmed = query.trim()
  if (!trimmed) return []

  const cacheKey = trimmed.toLowerCase()
  if (cache.searchResults.has(cacheKey)) {
    return cache.searchResults.get(cacheKey)
  }

  try {
    const response = await fetch(`${BASE_URL}/search/shows?q=${encodeURIComponent(trimmed)}`)
    if (!response.ok) {
      throw new Error(`TVMaze search error: ${response.status} ${response.statusText}`)
    }
    const data = await response.json()
    // Map items to standard show objects with score
    const formatted = data.map(item => ({
      ...item.show,
      searchScore: item.score
    }))
    cache.searchResults.set(cacheKey, formatted)
    return formatted
  } catch (error) {
    console.error(`Failed to search shows for query "${query}":`, error)
    throw error
  }
}

/**
 * Clear in-memory cache (useful for testing or manual refresh)
 */
export function clearApiCache() {
  cache.shows = null
  cache.showsPromise = null
  cache.showDetails.clear()
  cache.searchResults.clear()
}
