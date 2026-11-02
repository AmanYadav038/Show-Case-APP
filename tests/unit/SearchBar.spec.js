import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import SearchBar from '@/components/search/SearchBar.vue'

const mockPush = vi.fn()
const mockHandleInput = vi.fn()
const mockClearSearch = vi.fn()

const mockQuery = ref('')
const mockResults = ref([])
const mockIsSearching = ref(false)

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush })
}))

vi.mock('@/composables/useSearch.js', () => ({
  useSearch: () => ({
    query: mockQuery,
    results: mockResults,
    isSearching: mockIsSearching,
    handleInput: mockHandleInput,
    clearSearch: mockClearSearch
  })
}))

describe('SearchBar.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQuery.value = ''
    mockResults.value = []
    mockIsSearching.value = false
  })

  function createWrapper() {
    return mount(SearchBar, {
      global: {
        stubs: {
          RatingBadge: {
            template: '<span class="mock-rating-badge" />'
          }
        }
      }
    })
  }

  it('renders input box with placeholder and search icon', () => {
    const wrapper = createWrapper()
    const input = wrapper.find('input[type="search"]')
    expect(input.exists()).toBe(true)
    expect(input.attributes('placeholder')).toContain('Search TV shows')
  })

  it('handles input changes and calls handleInput', async () => {
    const wrapper = createWrapper()
    const input = wrapper.find('input[type="search"]')

    await input.setValue('breaking')
    expect(mockHandleInput).toHaveBeenCalledWith('breaking')
  })

  it('displays search suggestions dropdown when results exist', async () => {
    mockQuery.value = 'breaking'
    mockResults.value = [
      {
        id: 1,
        name: 'Breaking Bad',
        premiered: '2008-01-20',
        ended: '2013-09-29',
        genres: ['Drama'],
        rating: { average: 9.5 },
        image: { medium: 'http://img.com/bb.jpg' }
      }
    ]

    const wrapper = createWrapper()
    const input = wrapper.find('input[type="search"]')
    await input.trigger('focus')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.search-dropdown').exists()).toBe(true)
    expect(wrapper.find('.result-title').text()).toBe('Breaking Bad')
  })

  it('navigates to show detail and clears search when a result item is clicked', async () => {
    mockQuery.value = 'breaking'
    mockResults.value = [
      {
        id: 42,
        name: 'Breaking Bad',
        rating: { average: 9.5 }
      }
    ]

    const wrapper = createWrapper()
    const input = wrapper.find('input[type="search"]')
    await input.trigger('focus')
    await wrapper.vm.$nextTick()

    const item = wrapper.find('.result-item')
    await item.trigger('click')

    expect(mockPush).toHaveBeenCalledWith({
      name: 'show-detail',
      params: { id: 42 }
    })
    expect(mockClearSearch).toHaveBeenCalled()
  })

  it('submits search on search button or see-all click', async () => {
    mockQuery.value = 'witcher'
    const wrapper = createWrapper()

    const searchBtn = wrapper.find('.search-icon-btn')
    await searchBtn.trigger('click')

    expect(mockPush).toHaveBeenCalledWith({
      name: 'search',
      query: { q: 'witcher' }
    })
  })

  it('clears search when clear button is clicked', async () => {
    mockQuery.value = 'test'
    const wrapper = createWrapper()

    const clearBtn = wrapper.find('.clear-btn')
    expect(clearBtn.exists()).toBe(true)
    await clearBtn.trigger('click')

    expect(mockClearSearch).toHaveBeenCalled()
  })

  it('shows no results message when query has no matching results', async () => {
    mockQuery.value = 'xyz123nonexistent'
    mockResults.value = []
    mockIsSearching.value = false

    const wrapper = createWrapper()
    const input = wrapper.find('input[type="search"]')
    await input.trigger('focus')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.dropdown-status').text()).toContain('No TV shows found')
  })

  it('closes dropdown when clicking outside', async () => {
    mockQuery.value = 'friends'
    const wrapper = createWrapper()
    const input = wrapper.find('input[type="search"]')
    await input.trigger('focus')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.search-dropdown').exists()).toBe(true)

    document.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.search-dropdown').exists()).toBe(false)
  })
})
