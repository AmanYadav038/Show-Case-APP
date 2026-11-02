import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useHoverPreview } from '../../src/composables/useHoverPreview.js'

describe('useHoverPreview composable', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    const { hidePreview } = useHoverPreview()
    hidePreview(true)
  })

  it('initializes with hidden state', () => {
    const { isVisible, activeShow, anchorRect } = useHoverPreview()
    expect(isVisible.value).toBe(false)
    expect(activeShow.value).toBe(null)
    expect(anchorRect.value).toBe(null)
  })

  it('opens preview after debounce delay', () => {
    const { isVisible, activeShow, anchorRect, showPreview } = useHoverPreview()
    const mockShow = { id: 1, name: 'Game of Thrones' }
    const mockElement = {
      getBoundingClientRect: () => ({ top: 100, left: 100, width: 200, height: 300 })
    }

    showPreview(mockShow, mockElement)
    // Initially still false due to debounce timer
    expect(isVisible.value).toBe(false)

    // Fast-forward 300ms
    vi.advanceTimersByTime(300)

    expect(isVisible.value).toBe(true)
    expect(activeShow.value.name).toBe('Game of Thrones')
    expect(anchorRect.value.top).toBe(100)
  })

  it('closes preview immediately when immediate flag is true', () => {
    const { isVisible, showPreview, hidePreview } = useHoverPreview()
    const mockShow = { id: 1, name: 'Game of Thrones' }
    const mockElement = { getBoundingClientRect: () => ({ top: 0, left: 0, width: 0, height: 0 }) }

    showPreview(mockShow, mockElement)
    vi.advanceTimersByTime(300)
    expect(isVisible.value).toBe(true)

    hidePreview(true)
    expect(isVisible.value).toBe(false)
  })

  it('closes preview after grace period when immediate is false', () => {
    const { isVisible, showPreview, hidePreview } = useHoverPreview()
    const mockShow = { id: 1, name: 'Game of Thrones' }
    const mockElement = { getBoundingClientRect: () => ({ top: 0, left: 0, width: 0, height: 0 }) }

    showPreview(mockShow, mockElement)
    vi.advanceTimersByTime(300)
    expect(isVisible.value).toBe(true)

    hidePreview(false)
    // Still visible within 100ms grace period
    vi.advanceTimersByTime(100)
    expect(isVisible.value).toBe(true)

    // After 200ms total, closes
    vi.advanceTimersByTime(150)
    expect(isVisible.value).toBe(false)
  })

  it('keepPreviewOpen cancels the close timer', () => {
    const { isVisible, showPreview, hidePreview, keepPreviewOpen } = useHoverPreview()
    const mockShow = { id: 1, name: 'Game of Thrones' }
    const mockElement = { getBoundingClientRect: () => ({ top: 0, left: 0, width: 0, height: 0 }) }

    showPreview(mockShow, mockElement)
    vi.advanceTimersByTime(300)
    expect(isVisible.value).toBe(true)

    hidePreview(false)
    vi.advanceTimersByTime(100)

    // User moves mouse onto the popover
    keepPreviewOpen()
    vi.advanceTimersByTime(300)

    // Remains open!
    expect(isVisible.value).toBe(true)
  })
})
