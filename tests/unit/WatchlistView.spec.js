import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import WatchlistView from '../../src/views/WatchlistView.vue'
import { useWatchlist } from '../../src/composables/useWatchlist.js'

describe('WatchlistView.vue', () => {
  beforeEach(() => {
    const { watchlist } = useWatchlist()
    watchlist.value = []
  })

  it('renders empty watchlist state when no shows are saved', () => {
    const wrapper = mount(WatchlistView, {
      global: {
        stubs: {
          'router-link': { template: '<a><slot /></a>' }
        }
      }
    })

    expect(wrapper.text()).toContain('Your Watchlist is Empty')
    expect(wrapper.text()).toContain('0 shows saved')
    expect(wrapper.find('.empty-watchlist-box').exists()).toBe(true)
  })

  it('renders show cards grid when items exist in watchlist', () => {
    const { watchlist } = useWatchlist()
    watchlist.value = [
      { id: 101, name: 'Breaking Bad', rating: { average: 9.5 } },
      { id: 102, name: 'Chernobyl', rating: { average: 9.4 } }
    ]

    const wrapper = mount(WatchlistView, {
      global: {
        stubs: {
          'router-link': true,
          ShowCard: {
            props: ['show'],
            template: '<div class="stub-card">{{ show.name }}</div>'
          }
        }
      }
    })

    expect(wrapper.text()).toContain('2 shows saved')
    expect(wrapper.findAll('.stub-card').length).toBe(2)
    expect(wrapper.find('.empty-watchlist-box').exists()).toBe(false)
  })
})
