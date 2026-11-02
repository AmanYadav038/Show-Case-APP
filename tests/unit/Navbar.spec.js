import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import Navbar from '@/components/layout/Navbar.vue'

const mockPush = vi.fn()
const mockWatchlist = ref([{ id: 1, name: 'Sample Show' }])

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ name: 'dashboard', params: {}, fullPath: '/' })
}))

vi.mock('@/composables/useWatchlist.js', () => ({
  useWatchlist: () => ({
    watchlist: mockWatchlist
  })
}))

describe('Navbar.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockWatchlist.value = [{ id: 1, name: 'Sample Show' }]
  })

  function createWrapper() {
    return mount(Navbar, {
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
            props: ['to']
          },
          SearchBar: {
            template: '<div class="mock-search-bar" />'
          }
        },
        mocks: {
          $route: { name: 'dashboard', params: {}, fullPath: '/' }
        }
      }
    })
  }

  it('renders brand logo and nav links', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.logo-text').text()).toContain('ShowCase')
    expect(wrapper.find('.desktop-nav').exists()).toBe(true)
    expect(wrapper.find('.watchlist-count').text()).toBe('1')
  })

  it('toggles genre dropdown and navigates on genre selection', async () => {
    const wrapper = createWrapper()
    const dropdownToggle = wrapper.find('.dropdown-toggle')
    expect(wrapper.find('.genre-dropdown-menu').exists()).toBe(false)

    // Open dropdown
    await dropdownToggle.trigger('click')
    expect(wrapper.find('.genre-dropdown-menu').exists()).toBe(true)

    // Select a genre item (select 2nd genre, e.g. Drama)
    const genreBtns = wrapper.findAll('.genre-item-btn')
    expect(genreBtns.length).toBeGreaterThan(1)
    const genreBtn = genreBtns[1]
    const genreName = genreBtn.text().trim()
    await genreBtn.trigger('click')

    expect(mockPush).toHaveBeenCalledWith({
      name: 'genre-detail',
      params: { genre: genreName }
    })
    expect(wrapper.find('.genre-dropdown-menu').exists()).toBe(false)
  })

  it('toggles mobile menu and closes it on action', async () => {
    const wrapper = createWrapper()
    const hamburgerBtn = wrapper.find('.mobile-menu-btn')
    expect(wrapper.find('.mobile-drawer').exists()).toBe(false)

    // Open mobile menu
    await hamburgerBtn.trigger('click')
    expect(wrapper.find('.mobile-drawer').exists()).toBe(true)

    // Close via mobile link click
    const mobileLink = wrapper.find('.mobile-link')
    await mobileLink.trigger('click')
    expect(wrapper.find('.mobile-drawer').exists()).toBe(false)
  })

  it('closes genre dropdown on outside click', async () => {
    const wrapper = createWrapper()
    const dropdownToggle = wrapper.find('.dropdown-toggle')
    await dropdownToggle.trigger('click')
    expect(wrapper.find('.genre-dropdown-menu').exists()).toBe(true)

    // Simulate clicking outside
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.genre-dropdown-menu').exists()).toBe(false)
  })
})
