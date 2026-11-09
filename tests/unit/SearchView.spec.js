import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import SearchView from '../../src/views/SearchView.vue'
import * as tvmazeApi from '../../src/services/tvmazeApi.js'

// Mock vue-router
const mockRoute = {
  query: { q: '' }
}
const mockPush = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({ push: mockPush })
}))

function mountSearchView() {
  return mount(SearchView, {
    global: {
      stubs: {
        'router-link': {
          template: '<a :href="to"><slot /></a>',
          props: ['to']
        }
      }
    }
  })
}

describe('SearchView.vue', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockRoute.query = { q: '' }
    mockPush.mockReset()
  })

  it('renders initial universe prompt when no search query is present', () => {
    const wrapper = mountSearchView()
    expect(wrapper.find('.empty-prompt').exists()).toBe(true)
    expect(wrapper.text()).toContain('Search the TVMaze Universe')
  })

  it('searches by show title and displays show cards', async () => {
    mockRoute.query = { q: 'Breaking Bad' }
    const mockShows = [
      { id: 169, name: 'Breaking Bad', genres: ['Drama', 'Crime'], rating: { average: 9.5 } }
    ]

    vi.spyOn(tvmazeApi, 'searchShows').mockResolvedValueOnce(mockShows)
    vi.spyOn(tvmazeApi, 'searchPeople').mockResolvedValueOnce([])

    const wrapper = mountSearchView()
    await flushPromises()

    expect(wrapper.text()).toContain('Breaking Bad')
    expect(wrapper.find('.actor-spotlight-card').exists()).toBe(false)
  })

  it('identifies actor search and displays actor spotlight card with starred shows', async () => {
    mockRoute.query = { q: 'Bryan Cranston' }
    const mockPeople = [
      {
        id: 1,
        name: 'Bryan Cranston',
        gender: 'Male',
        country: { name: 'United States' },
        birthday: '1956-03-07',
        image: { medium: 'http://static.tvmaze.com/bryan.jpg' }
      }
    ]
    const mockStarredShows = [
      { id: 169, name: 'Breaking Bad', genres: ['Drama'], rating: { average: 9.5 } },
      { id: 1445, name: 'Your Honor', genres: ['Drama'], rating: { average: 8.1 } }
    ]

    // searchShows returns empty because no show is named "Bryan Cranston"
    vi.spyOn(tvmazeApi, 'searchShows').mockResolvedValueOnce([])
    vi.spyOn(tvmazeApi, 'searchPeople').mockResolvedValueOnce(mockPeople)
    vi.spyOn(tvmazeApi, 'fetchPersonCastCredits').mockResolvedValueOnce(mockStarredShows)

    const wrapper = mountSearchView()
    await flushPromises()

    // Actor spotlight card should be displayed!
    const actorCard = wrapper.find('.actor-spotlight-card')
    expect(actorCard.exists()).toBe(true)
    expect(actorCard.text()).toContain('Bryan Cranston')
    expect(actorCard.text()).toContain('United States')
    expect(actorCard.text()).toContain('1956-03-07')

    // Shows starring Bryan Cranston should be rendered!
    expect(wrapper.text()).toContain('Breaking Bad')
    expect(wrapper.text()).toContain('Your Honor')
  })

  it('renders search category dropdown with all, shows, actors, and genres options', () => {
    const wrapper = mountSearchView()
    const select = wrapper.find('.search-type-select')
    expect(select.exists()).toBe(true)

    const options = select.findAll('option')
    expect(options.length).toBe(4)
    expect(options.map(o => o.attributes('value'))).toEqual(['all', 'shows', 'actors', 'genres'])
  })

  it('hides actor spotlight when searching explicitly in shows mode', async () => {
    mockRoute.query = { q: 'Bryan Cranston', type: 'shows' }
    const mockShows = [
      { id: 999, name: 'The Bryan Cranston Special', genres: ['Comedy'], rating: { average: 7.0 } }
    ]

    vi.spyOn(tvmazeApi, 'searchShows').mockResolvedValueOnce(mockShows)

    const wrapper = mountSearchView()
    await flushPromises()

    expect(wrapper.text()).toContain('The Bryan Cranston Special')
    // Actor spotlight MUST be hidden when in 'shows' mode!
    expect(wrapper.find('.actor-spotlight-card').exists()).toBe(false)
  })

  it('shows genre spotlight and hides actor spotlight when searching in genres mode', async () => {
    mockRoute.query = { q: 'Drama', type: 'genres' }
    const mockDramaShows = [
      { id: 101, name: 'Succession', genres: ['Drama'], rating: { average: 9.0 } }
    ]

    vi.spyOn(tvmazeApi, 'searchShows').mockResolvedValueOnce(mockDramaShows)

    const wrapper = mountSearchView()
    await flushPromises()

    expect(wrapper.find('.genre-spotlight-card').exists()).toBe(true)
    expect(wrapper.find('.genre-spotlight-title').text()).toContain('Drama')
    expect(wrapper.find('.actor-spotlight-card').exists()).toBe(false)
  })

  it('displays empty state when actor has no shows and query matches nothing', async () => {
    mockRoute.query = { q: 'UnknownActorXYZ' }
    vi.spyOn(tvmazeApi, 'searchShows').mockResolvedValueOnce([])
    vi.spyOn(tvmazeApi, 'searchPeople').mockResolvedValueOnce([])

    const wrapper = mountSearchView()
    await flushPromises()

    expect(wrapper.find('.no-results-box').exists()).toBe(true)
    expect(wrapper.text()).toContain('No TV Shows Found')
  })
})
