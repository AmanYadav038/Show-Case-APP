import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroBanner from '../../src/components/shows/HeroBanner.vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() })
}))

describe('HeroBanner.vue', () => {
  const mockShows = [
    {
      id: 1,
      name: 'Game of Thrones',
      rating: { average: 9.3 },
      premiered: '2011-04-17',
      ended: '2019-05-19',
      runtime: 60,
      summary: 'Nine noble families fight for control over the lands of Westeros.',
      genres: ['Action', 'Drama', 'Fantasy'],
      image: { original: 'http://img.com/got.jpg' }
    },
    {
      id: 2,
      name: 'Breaking Bad',
      rating: { average: 9.5 },
      premiered: '2008-01-20',
      ended: '2013-09-29',
      summary: 'A chemistry teacher diagnosed with lung cancer turns to manufacturing meth.',
      genres: ['Crime', 'Drama'],
      image: { original: 'http://img.com/bb.jpg' }
    }
  ]

  it('renders hero banner with featured show details', () => {
    const wrapper = mount(HeroBanner, {
      props: { shows: mockShows },
      global: {
        stubs: {
          'router-link': { template: '<a><slot /></a>' },
          RatingBadge: { template: '<span>{{ rating?.average }}</span>' }
        }
      }
    })

    expect(wrapper.text()).toContain('Game of Thrones')
    expect(wrapper.text()).toContain('2011–2019')
    expect(wrapper.text()).toContain('Action')
  })

  it('switches slide when dot buttons are clicked', async () => {
    const wrapper = mount(HeroBanner, {
      props: { shows: mockShows },
      global: {
        stubs: {
          'router-link': true,
          RatingBadge: true
        }
      }
    })

    const dots = wrapper.findAll('.indicator-dot')
    expect(dots.length).toBe(2)
    await dots[1].trigger('click')

    expect(wrapper.text()).toContain('Breaking Bad')
  })

  it('does not render when shows array is empty', () => {
    const wrapper = mount(HeroBanner, {
      props: { shows: [] }
    })

    expect(wrapper.find('.hero-banner-section').exists()).toBe(false)
  })
})
