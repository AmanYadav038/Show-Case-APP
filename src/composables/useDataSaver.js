import { ref } from 'vue'
import { getImageUrl } from '../utils/formatters.js'

// Global shared state for low-bandwidth / data saver mode
const isDataSaverActive = ref(false)

// Hydrate from localStorage if in browser environment
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const stored = localStorage.getItem('showcase_data_saver')
    if (stored !== null) {
      isDataSaverActive.value = stored === 'true'
    }
  } catch (e) {
    // Graceful fallback if localStorage is restricted
  }
}

/**
 * Generate a lightweight SVG vector placeholder to replace images in low-bandwidth mode.
 * Generates zero external network requests and renders instantly.
 *
 * @param {string} title - Show title
 * @param {'medium'|'original'} size - Poster vs Backdrop
 * @returns {string} SVG Data URI
 */
export function generatePlaceholderSvg(title = '', size = 'medium') {
  const isBackdrop = size === 'original'
  const width = isBackdrop ? 960 : 300
  const height = isBackdrop ? 540 : 450
  const cleanTitle = (title || 'ShowCase TV')
    .replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]))

  const titleSnippet = cleanTitle.length > 20 ? cleanTitle.slice(0, 18) + '…' : cleanTitle

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="g_${isBackdrop ? 'b' : 'p'}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a1414"/>
      <stop offset="50%" stop-color="#2b1f1f"/>
      <stop offset="100%" stop-color="#141111"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g_${isBackdrop ? 'b' : 'p'})"/>
  <rect x="${width * 0.08}" y="${height * 0.08}" width="${width * 0.84}" height="${height * 0.84}" rx="10" fill="none" stroke="#4a3737" stroke-width="1.5" stroke-dasharray="6,6"/>
  <g transform="translate(${width / 2}, ${height * 0.42})">
    <circle r="${isBackdrop ? 36 : 26}" fill="#241919" stroke="#e63946" stroke-width="2"/>
    <path d="M-8 -10 L10 0 L-8 10 Z" fill="#e63946"/>
  </g>
  <text x="${width / 2}" y="${height * 0.65}" font-family="system-ui, -apple-system, sans-serif" font-size="${isBackdrop ? 24 : 15}" font-weight="700" fill="#f8fafc" text-anchor="middle">
    ${titleSnippet}
  </text>
  <text x="${width / 2}" y="${height * 0.76}" font-family="system-ui, -apple-system, sans-serif" font-size="${isBackdrop ? 15 : 10}" font-weight="700" fill="#e63946" text-anchor="middle" letter-spacing="1">
    ⚡ LOW-RES PLACEHOLDER
  </text>
</svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export function useDataSaver() {
  function toggleDataSaver() {
    isDataSaverActive.value = !isDataSaverActive.value
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('showcase_data_saver', String(isDataSaverActive.value))
      } catch (e) {
        // Ignore localStorage error
      }
    }
    return isDataSaverActive.value
  }

  function setDataSaver(enabled) {
    isDataSaverActive.value = Boolean(enabled)
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('showcase_data_saver', String(isDataSaverActive.value))
      } catch (e) {
        // Ignore localStorage error
      }
    }
  }

  /**
   * Get image URL with automatic fallback to lightweight vector placeholder
   * when data saver / low-res mode is active.
   */
  function getOptimizedImageUrl(image, size = 'medium', fallbackTitle = '') {
    if (isDataSaverActive.value) {
      return generatePlaceholderSvg(fallbackTitle, size)
    }
    return getImageUrl(image, size)
  }

  return {
    isDataSaverActive,
    toggleDataSaver,
    setDataSaver,
    getOptimizedImageUrl,
    generatePlaceholderSvg
  }
}
