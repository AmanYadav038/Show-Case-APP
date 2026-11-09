import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDataSaver, generatePlaceholderSvg } from '../../src/composables/useDataSaver.js'

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
    const { isDataSaverActive, setDataSaver } = useDataSaver()

    setDataSaver(true)
    expect(isDataSaverActive.value).toBe(true)

    setDataSaver(false)
    expect(isDataSaverActive.value).toBe(false)
  })

  it('generatePlaceholderSvg generates valid SVG data URI containing show title', () => {
    const svgDataUri = generatePlaceholderSvg('Breaking Bad', 'medium')
    expect(svgDataUri.startsWith('data:image/svg+xml')).toBe(true)
    expect(decodeURIComponent(svgDataUri)).toContain('Breaking Bad')
    expect(decodeURIComponent(svgDataUri)).toContain('LOW-RES PLACEHOLDER')
  })

  it('generatePlaceholderSvg generates backdrop aspect ratio for original size', () => {
    const backdropUri = generatePlaceholderSvg('Stranger Things', 'original')
    expect(backdropUri.startsWith('data:image/svg+xml')).toBe(true)
    expect(decodeURIComponent(backdropUri)).toContain('viewBox="0 0 960 540"')
  })

  it('getOptimizedImageUrl returns real image when inactive and placeholder when active', () => {
    const { isDataSaverActive, toggleDataSaver, getOptimizedImageUrl } = useDataSaver()
    const mockImage = {
      medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/1/4388.jpg',
      original: 'https://static.tvmaze.com/uploads/images/original_untouched/1/4388.jpg'
    }

    // When inactive (default):
    expect(isDataSaverActive.value).toBe(false)
    expect(getOptimizedImageUrl(mockImage, 'medium', 'Show')).toBe(mockImage.medium)
    expect(getOptimizedImageUrl(mockImage, 'original', 'Show')).toBe(mockImage.original)

    // When active:
    toggleDataSaver()
    expect(isDataSaverActive.value).toBe(true)
    const optMedium = getOptimizedImageUrl(mockImage, 'medium', 'Breaking Bad')
    expect(optMedium.startsWith('data:image/svg+xml')).toBe(true)
    expect(decodeURIComponent(optMedium)).toContain('Breaking Bad')

    const optOriginal = getOptimizedImageUrl(mockImage, 'original', 'Breaking Bad')
    expect(optOriginal.startsWith('data:image/svg+xml')).toBe(true)
    expect(decodeURIComponent(optOriginal)).toContain('viewBox="0 0 960 540"')
  })
})
