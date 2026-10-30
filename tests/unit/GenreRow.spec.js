import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GenreRow from '../../src/components/shows/GenreRow.vue'

describe('GenreRow.vue', () => {
  const sampleShows = [
    {
      id: 1,
      name: 'Game of Thrones',
      rating: { average: 9.3 },
      premiered: '2011-04-17',
      ended: '2019-05-19',
      genres: ['Action', 'Drama', 'Fantasy'],
      image: { medium: 'http://example.com/got.jpg' }
    },
    {
      id: 2,
      name: 'Chernobyl',
      rating: { average: 9.5 },
      premiered: '2019-05-06',
      ended: '2019-06-03',
      genres: ['Drama', 'History'],
      image: { medium: 'http://example.com/chernobyl.jpg' }
    }
  ]

  it('renders section title and show count correctly', () => {
    const wrapper = mount(GenreRow, {
      props: {
        title: 'Drama Shows',
        shows: sampleShows,
        genreKey: 'Drama'
      },
      global: {
        stubs: {
          ShowCard: {
            props: ['show', 'showRank'],
            template: '<div class="stub-card">{{ show.name }}</div>'
          }
        }
      }
    })

    expect(wrapper.text()).toContain('Drama Shows')
    expect(wrapper.text()).toContain('2 shows')
    expect(wrapper.findAll('.stub-card').length).toBe(2)
  })

  it('does not render if shows array is empty', () => {
    const wrapper = mount(GenreRow, {
      props: {
        title: 'Empty Genre',
        shows: []
      }
    })

    expect(wrapper.find('section').exists()).toBe(false)
  })
})
