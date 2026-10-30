import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ShowCard from '../../src/components/shows/ShowCard.vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

describe('ShowCard.vue', () => {
  const mockShow = {
    id: 1,
    name: 'Breaking Bad',
    rating: { average: 9.5 },
    premiered: '2008-01-20',
    ended: '2013-09-29',
    genres: ['Drama', 'Crime', 'Thriller'],
    image: { medium: 'http://example.com/bb.jpg' }
  }

  it('renders title, year, genre and rating for standard unranked card', () => {
    const wrapper = mount(ShowCard, {
      props: {
        show: mockShow
      },
      global: {
        stubs: {
          RatingBadge: {
            props: ['rating'],
            template: '<span class="stub-rating">{{ rating.average }}</span>'
          }
        }
      }
    })

    expect(wrapper.text()).toContain('Breaking Bad')
    expect(wrapper.text()).toContain('2008–2013')
    expect(wrapper.text()).toContain('Drama')
    expect(wrapper.find('.rank-badge').exists()).toBe(false)
    expect(wrapper.find('.rating-overlay').classes()).toContain('rating-top')
  })

  it('renders rank badge on top and puts rating overlay at bottom when showRank is provided to prevent overlap', () => {
    const wrapper = mount(ShowCard, {
      props: {
        show: mockShow,
        showRank: 1
      },
      global: {
        stubs: {
          RatingBadge: {
            props: ['rating'],
            template: '<span class="stub-rating">{{ rating.average }}</span>'
          }
        }
      }
    })

    const rankBadge = wrapper.find('.rank-badge')
    expect(rankBadge.exists()).toBe(true)
    expect(rankBadge.text()).toContain('1')

    const ratingOverlay = wrapper.find('.rating-overlay')
    expect(ratingOverlay.exists()).toBe(true)
    // Rating overlay should have rating-bottom class, keeping rank and rating cleanly separated
    expect(ratingOverlay.classes()).toContain('rating-bottom')
    expect(ratingOverlay.classes()).not.toContain('rating-top')
  })
})
