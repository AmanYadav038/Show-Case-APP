/**
 * Strips HTML tags and decodes common entities from a string.
 * Optionally truncates cleanly at word boundary.
 * @param {string} html
 * @param {number} [maxLength=0]
 * @returns {string}
 */
export function stripHtml(html, maxLength = 0) {
  if (!html) return 'No synopsis available.'
  
  // Strip tags using regex
  let text = html.replace(/<[^>]+>/g, '').trim()
  
  // Unescape standard HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')

  if (maxLength > 0 && text.length > maxLength) {
    const truncated = text.substring(0, maxLength)
    const lastSpace = truncated.lastIndexOf(' ')
    return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...'
  }

  return text
}

/**
 * Format rating for display.
 * @param {number|Object} rating - rating number or TVMaze { average: 8.5 }
 * @returns {string}
 */
export function formatRating(rating) {
  const value = typeof rating === 'object' && rating !== null ? rating.average : rating
  if (value === null || value === undefined || isNaN(value)) {
    return '—'
  }
  return Number(value).toFixed(1)
}

/**
 * Format premiered and ended dates into year range string.
 * e.g., "2008–2013", "2021–", or "2019"
 * @param {string} premiered - YYYY-MM-DD
 * @param {string} [ended] - YYYY-MM-DD
 * @returns {string}
 */
export function formatYearRange(premiered, ended) {
  if (!premiered) return '—'
  const startYear = premiered.split('-')[0]
  if (!ended) {
    return `${startYear}–`
  }
  const endYear = ended.split('-')[0]
  return startYear === endYear ? startYear : `${startYear}–${endYear}`
}

/**
 * Format runtime in minutes to readable string.
 * @param {number} minutes
 * @returns {string}
 */
export function formatRuntime(minutes) {
  if (!minutes) return ''
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hrs === 0) return `${mins}m`
  if (mins === 0) return `${hrs}h`
  return `${hrs}h ${mins}m`
}

/**
 * Format schedule object into readable string.
 * @param {Object} schedule - { days: ['Monday'], time: '21:00' }
 * @returns {string}
 */
export function formatSchedule(schedule) {
  if (!schedule) return ''
  const days = schedule.days?.join(', ') || ''
  const time = schedule.time ? `at ${schedule.time}` : ''
  if (!days && !time) return ''
  return [days, time].filter(Boolean).join(' ')
}

/**
 * Get safe image URL or placeholder.
 * @param {Object} image - TVMaze { medium, original }
 * @param {'medium'|'original'} [size='medium']
 * @returns {string|null}
 */
export function getImageUrl(image, size = 'medium') {
  if (!image) return null
  return image[size] || image.medium || image.original || null
}
