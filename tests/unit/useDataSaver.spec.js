import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDataSaver, generatePlaceholderSvg, playButtonSvg } from '../../src/composables/useDataSaver.js'

describe('useDataSaver composable', () => {
  beforeEach(() => {
    const { setDataSaver } = useDataSaver()
    setDataSaver(false)
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear()
    }
  })

  it('initializes with data saver inactive by default', () => {
    const { isDataSaverActive } = useDataSaver()
    expect(isDataSaverActive.value).toBe(false)
  })

  it('toggleDataSaver flips state between active and inactive', () => {
    const { isDataSaverActive, toggleDataSaver } = useDataSaver()

    const activeNow = toggleDataSaver()
    expect(activeNow).toBe(true)
    expect(isDataSaverActive.value).toBe(true)

    const inactiveNow = toggleDataSaver()
    expect(inactiveNow).toBe(false)
    expect(isDataSaverActive.value).toBe(false)
  })

  it('setDataSaver sets explicit boolean value', () => {
    const { isDataSaverActive, effectiveDataSaverActive, setDataSaver } = useDataSaver()

    setDataSaver(true)
    expect(isDataSaverActive.value).toBe(true)
    expect(effectiveDataSaverActive.value).toBe(true)

    setDataSaver(false)
    expect(isDataSaverActive.value).toBe(false)
    expect(effectiveDataSaverActive.value).toBe(false)
  })

  it('generatePlaceholderSvg returns playbutton svg asset as src without inline svg strings', () => {
    const svgSrc = generatePlaceholderSvg('Breaking Bad', 'medium')
    expect(svgSrc).toBe(playButtonSvg)
    expect(typeof svgSrc).toBe('string')
    expect(svgSrc.length).toBeGreaterThan(0)
  })

  it('toggleDataSaver does not instantly change effective mode; updates on navigation sync', () => {
    const { isDataSaverActive, effectiveDataSaverActive, toggleDataSaver, syncDataSaverOnNavigation } = useDataSaver()

    expect(isDataSaverActive.value).toBe(false)
    expect(effectiveDataSaverActive.value).toBe(false)

    // User clicks floating action button on current page
    toggleDataSaver()
    expect(isDataSaverActive.value).toBe(true)
    // Does NOT change instantly on current screen
    expect(effectiveDataSaverActive.value).toBe(false)

    // User redirects to another page (router.afterEach calls syncDataSaverOnNavigation)
    syncDataSaverOnNavigation()
    expect(effectiveDataSaverActive.value).toBe(true)
  })

  it('getOptimizedImageUrl uses playbutton svg as src in low-res mode and as fallback for missing images', () => {
    const { toggleDataSaver, syncDataSaverOnNavigation, getOptimizedImageUrl } = useDataSaver()
    const mockImage = {
      medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/1/4388.jpg',
      original: 'https://static.tvmaze.com/uploads/images/original_untouched/1/4388.jpg'
    }

    // In HD mode (default):
    expect(getOptimizedImageUrl(mockImage, 'medium', 'Show')).toBe(mockImage.medium)
    expect(getOptimizedImageUrl(mockImage, 'original', 'Show')).toBe(mockImage.original)

    // Enable Low-Res and simulate redirection to another page:
    toggleDataSaver()
    syncDataSaverOnNavigation()

    // In Low-Res Mode, uses playbutton svg as src like the rest of the icons in the project:
    expect(getOptimizedImageUrl(mockImage, 'original', 'Show')).toBe(playButtonSvg)
    expect(getOptimizedImageUrl(mockImage, 'medium', 'Show')).toBe(playButtonSvg)

    // Fallback for null image also returns playbutton svg:
    expect(getOptimizedImageUrl(null, 'medium', 'Empty Show')).toBe(playButtonSvg)
  })
})
