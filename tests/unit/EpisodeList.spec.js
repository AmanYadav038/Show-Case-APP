import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EpisodeList from '../../src/components/shows/EpisodeList.vue'

describe('EpisodeList.vue', () => {
  const mockEpisodes = [
    {
      id: 1,
      name: 'Pilot',
      season: 1,
      number: 1,
      runtime: 58,
      rating: { average: 8.9 },
      summary: 'A high school chemistry teacher diagnosed with cancer.'
    },
    {
      id: 2,
      name: "Cat's in the Bag...",
      season: 1,
      number: 2,
      runtime: 48,
      rating: { average: 8.7 },
      summary: 'Walt and Jesse attempt to clean up.'
    },
    {
      id: 3,
      name: 'Seven Thirty-Seven',
      season: 2,
      number: 1,
      runtime: 47,
      rating: { average: 8.8 },
      summary: 'Walt and Jesse meet with Tuco.'
    }
  ]

  it('renders episodes section, season tabs, and episode cards', () => {
    const wrapper = mount(EpisodeList, {
      props: { episodes: mockEpisodes },
      global: {
        stubs: {
          RatingBadge: { template: '<span>{{ rating?.average }}</span>' }
        }
      }
    })

    expect(wrapper.text()).toContain('Episodes')
    expect(wrapper.text()).toContain('(3 total)')
    expect(wrapper.text()).toContain('Season 1')
    expect(wrapper.text()).toContain('Season 2')
    expect(wrapper.text()).toContain('Pilot')
  })

  it('switches displayed episodes when changing season select', async () => {
    const wrapper = mount(EpisodeList, {
      props: { episodes: mockEpisodes },
      global: {
        stubs: {
          RatingBadge: true
        }
      }
    })

    const select = wrapper.find('select.season-dropdown')
    expect(select.exists()).toBe(true)

    await select.setValue(2)
    expect(wrapper.text()).toContain('Seven Thirty-Seven')
  })

  it('does not render when episodes array is empty', () => {
    const wrapper = mount(EpisodeList, {
      props: { episodes: [] }
    })

    expect(wrapper.find('.episodes-section').exists()).toBe(false)
  })
})
