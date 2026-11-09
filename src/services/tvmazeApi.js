const BASE_URL = 'https://api.tvmaze.com'

// In-memory cache to prevent redundant network calls during navigation
const cache = {
  shows: null,
  showsPromise: null,
  showPages: new Map(),
  showDetails: new Map(),
  searchResults: new Map()
}

/**
 * Fetch a list of shows from TVMaze index.
 * Caches the response in memory for snappy navigation.
 * @param {number} page - Page index (0 = first 250 shows, 1 = next 250, etc.)
 * @returns {Promise<Array>}
 */
export async function fetchShows(page = 0) {
  // Only cache page 0 in memory for snappy navigation; subsequent pages for on-demand
  // genre loads are fetched fresh and not cached globally
  if (page === 0) {
    if (cache.shows) {
      return cache.shows
    }
    if (cache.showPages.has(0)) {
      return cache.showPages.get(0)
    }
  }

  try {
    const response = await fetch(`${BASE_URL}/shows?page=${page}`)
    if (!response.ok) {
      throw new Error(`TVMaze API error: ${response.status} ${response.statusText}`)
    }
    const data = await response.json()
    if (page === 0) {
      cache.shows = data
      cache.showPages.set(0, data)
    }
    return data
  } catch (error) {
    console.error('Failed to fetch shows:', error)
    throw error
  }
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
 * Search people/actors by query string.
 * @param {string} query
 * @returns {Promise<Array>}
 */
export async function searchPeople(query) {
  const trimmed = query.trim()
  if (!trimmed) return []

  const cacheKey = `people_${trimmed.toLowerCase()}`
  if (cache.searchResults.has(cacheKey)) {
    return cache.searchResults.get(cacheKey)
  }

  try {
    const response = await fetch(`${BASE_URL}/search/people?q=${encodeURIComponent(trimmed)}`)
    if (!response.ok) {
      throw new Error(`TVMaze search error: ${response.status} ${response.statusText}`)
    }
    const data = await response.json()
    const formatted = data.map(item => ({
      ...item.person,
      searchScore: item.score,
      resultType: 'person'
    }))
    cache.searchResults.set(cacheKey, formatted)
    return formatted
  } catch (error) {
    console.error(`Failed to search people for query "${query}":`, error)
    throw error
  }
}

/**
 * Fetch cast credits for a person by their TVMaze person ID.
 * Extracts embedded show objects so the UI can display shows starring the actor.
 * @param {string|number} personId
 * @returns {Promise<Array>} Array of show objects
 */
export async function fetchPersonCastCredits(personId) {
  if (!personId) return []

  const cacheKey = `person_credits_${personId}`
  if (cache.searchResults.has(cacheKey)) {
    return cache.searchResults.get(cacheKey)
  }

  try {
    const response = await fetch(`${BASE_URL}/people/${personId}/castcredits?embed=show`)
    if (!response.ok) {
      throw new Error(`TVMaze person credits error: ${response.status} ${response.statusText}`)
    }
    const data = await response.json()
    // Each item has _embedded.show
    const showMap = new Map()
    for (const credit of data) {
      const show = credit?._embedded?.show
      if (show && show.id && !showMap.has(show.id)) {
        showMap.set(show.id, {
          ...show,
          characterName: credit?._links?.character?.name || null
        })
      }
    }
    const shows = Array.from(showMap.values())
    cache.searchResults.set(cacheKey, shows)
    return shows
  } catch (error) {
    console.error(`Failed to fetch cast credits for person ID ${personId}:`, error)
    throw error
  }
}

/**
 * Clear in-memory cache (useful for testing or manual refresh)
 */
export function clearApiCache() {
  cache.shows = null
  cache.showsPromise = null
  cache.showPages.clear()
  cache.showDetails.clear()
  cache.searchResults.clear()
}
