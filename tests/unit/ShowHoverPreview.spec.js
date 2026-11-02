import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, DOMWrapper } from '@vue/test-utils'
import { ref } from 'vue'
import ShowHoverPreview from '@/components/shows/ShowHoverPreview.vue'

const mockPush = vi.fn()
const mockHidePreview = vi.fn()
const mockKeepPreviewOpen = vi.fn()
const mockToggleWatchlist = vi.fn()
const mockIsInWatchlist = vi.fn().mockReturnValue(false)

const mockActiveShow = ref(null)
const mockAnchorRect = ref(null)
const mockIsVisible = ref(false)

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ fullPath: '/' })
}))

vi.mock('@/composables/useHoverPreview.js', () => ({
  useHoverPreview: () => ({
    activeShow: mockActiveShow,
    anchorRect: mockAnchorRect,
    isVisible: mockIsVisible,
    hidePreview: mockHidePreview,
    keepPreviewOpen: mockKeepPreviewOpen
  })
}))

vi.mock('@/composables/useWatchlist.js', () => ({
  useWatchlist: () => ({
    isInWatchlist: mockIsInWatchlist,
    toggleWatchlist: mockToggleWatchlist
  })
}))

describe('ShowHoverPreview.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockActiveShow.value = null
    mockAnchorRect.value = null
    mockIsVisible.value = false
    mockIsInWatchlist.mockReturnValue(false)
    document.body.innerHTML = ''
  })

  function createWrapper() {
    return mount(ShowHoverPreview, {
      attachTo: document.body,
      global: {
        stubs: {
          RatingBadge: {
            template: '<span class="mock-rating" />'
          }
        }
      }
    })
  }

  it('does not render card in document.body when isVisible is false', () => {
    createWrapper()
    const cardEl = document.body.querySelector('.hover-popover-card')
    expect(cardEl).toBeNull()
  })

  it('renders card with show details when visible', async () => {
    mockActiveShow.value = {
      id: 99,
      name: 'Severance',
      summary: '<p>Mark leads a team of office workers whose memories have been surgically divided.</p>',
      rating: { average: 8.7 },
      premiered: '2022-02-18',
      ended: null,
      runtime: 55,
      status: 'Running',
      genres: ['Drama', 'Sci-Fi', 'Thriller']
    }
    mockAnchorRect.value = {
      top: 200,
      bottom: 450,
      left: 100,
      width: 200,
      height: 250
    }
    mockIsVisible.value = true

    const wrapper = createWrapper()
    await wrapper.vm.$nextTick()

    const cardEl = document.body.querySelector('.hover-popover-card')
    expect(cardEl).not.toBeNull()
    const card = new DOMWrapper(cardEl)
    expect(card.find('.popover-title').text()).toBe('Severance')
    expect(card.find('.popover-synopsis').text()).toContain('Mark leads a team')
    expect(card.findAll('.genre-pill').length).toBe(3)
  })

  it('calls keepPreviewOpen on mouseenter and hidePreview on mouseleave', async () => {
    mockActiveShow.value = { id: 1, name: 'Dark' }
    mockAnchorRect.value = { top: 100, bottom: 300, left: 100, width: 200 }
    mockIsVisible.value = true

    const wrapper = createWrapper()
    await wrapper.vm.$nextTick()

    const cardEl = document.body.querySelector('.hover-popover-card')
    const card = new DOMWrapper(cardEl)
    await card.trigger('mouseenter')
    expect(mockKeepPreviewOpen).toHaveBeenCalled()

    await card.trigger('mouseleave')
    expect(mockHidePreview).toHaveBeenCalledWith(false)
  })

  it('toggles watchlist when watchlist button is clicked', async () => {
    mockActiveShow.value = { id: 10, name: 'Arcane' }
    mockAnchorRect.value = { top: 100, bottom: 300, left: 100, width: 200 }
    mockIsVisible.value = true

    const wrapper = createWrapper()
    await wrapper.vm.$nextTick()

    const cardEl = document.body.querySelector('.hover-popover-card')
    const card = new DOMWrapper(cardEl)
    const btn = card.find('.action-btn-icon')
    await btn.trigger('click')

    expect(mockToggleWatchlist).toHaveBeenCalledWith(mockActiveShow.value)
  })

  it('navigates to details view when Details button is clicked', async () => {
    mockActiveShow.value = { id: 10, name: 'Arcane' }
    mockAnchorRect.value = { top: 100, bottom: 300, left: 100, width: 200 }
    mockIsVisible.value = true

    const wrapper = createWrapper()
    await wrapper.vm.$nextTick()

    const cardEl = document.body.querySelector('.hover-popover-card')
    const card = new DOMWrapper(cardEl)
    const btn = card.find('.action-btn-primary')
    await btn.trigger('click')

    expect(mockHidePreview).toHaveBeenCalledWith(true)
    expect(mockPush).toHaveBeenCalledWith({
      name: 'show-detail',
      params: { id: 10 }
    })
  })
})
