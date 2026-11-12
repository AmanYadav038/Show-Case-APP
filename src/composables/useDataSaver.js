import { ref } from 'vue'
import { getImageUrl } from '../utils/formatters.js'
import playButtonSvg from '@/assets/icons/play-button.svg'

// Export static play button icon asset
export { playButtonSvg }

// Global user-selected preference (toggled by the floating action button)
const isDataSaverActive = ref(false)

// Effective resolution mode applied to the current route/view.
// Clicking the floating action button does NOT change images on the current screen instantly,
// but reduces the resolution on further page redirections/navigations!
const effectiveDataSaverActive = ref(false)

// Hydrate from localStorage if in browser environment
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const stored = localStorage.getItem('showcase_data_saver')
    if (stored !== null) {
      const isEnabled = stored === 'true'
      isDataSaverActive.value = isEnabled
      effectiveDataSaverActive.value = isEnabled
    }
  } catch (e) {
    // Graceful fallback if localStorage is restricted
  }
}

/**
 * Synchronize the effective resolution state upon route navigation / redirection.
 */
export function syncDataSaverOnNavigation() {
  effectiveDataSaverActive.value = isDataSaverActive.value
}

/**
 * Returns the playbutton SVG asset as src for placeholders and low-res mode.
 * No inline SVG code is generated.
 *
 * @returns {string} Play button SVG asset URL
 */
export function generatePlaceholderSvg() {
  return playButtonSvg
}

function persistToStorage(val) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem('showcase_data_saver', String(val))
    } catch (e) {
      // Ignore localStorage error
    }
  }
}

export function useDataSaver() {
  function toggleDataSaver() {
    isDataSaverActive.value = !isDataSaverActive.value
    persistToStorage(isDataSaverActive.value)
    return isDataSaverActive.value
  }

  function setDataSaver(enabled, immediate = true) {
    isDataSaverActive.value = Boolean(enabled)
    if (immediate) {
      effectiveDataSaverActive.value = Boolean(enabled)
    }
    persistToStorage(isDataSaverActive.value)
  }

  /**
   * Resolves the image URL:
   * - In low-res mode: Uses the playbutton SVG as src like the rest of the icons in the project,
   *   eliminating network image downloads on redirection while keeping existing images intact before navigation.
   * - In HD mode: Returns the requested TVMaze API size ('original' for backdrops, 'medium' for cards),
   *   falling back to playbutton SVG if the show has no image.
   */
  function getOptimizedImageUrl(image, size = 'medium', fallbackTitle = '') {
    if (effectiveDataSaverActive.value) {
      return playButtonSvg
    }

    if (!image) {
      return playButtonSvg
    }

    return getImageUrl(image, size) || playButtonSvg
  }

  return {
    isDataSaverActive,
    effectiveDataSaverActive,
    toggleDataSaver,
    setDataSaver,
    syncDataSaverOnNavigation,
    getOptimizedImageUrl,
    generatePlaceholderSvg,
    playButtonSvg
  }
}
