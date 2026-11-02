import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CastList from '../../src/components/shows/CastList.vue'

describe('CastList.vue', () => {
  const mockCast = [
    {
      person: { name: 'Bryan Cranston', image: { medium: 'http://img.com/bc.jpg' } },
      character: { name: 'Walter White' }
    },
    {
      person: { name: 'Aaron Paul', image: null },
      character: { name: 'Jesse Pinkman' }
    }
  ]

  it('renders top cast header and actor cards', () => {
    const wrapper = mount(CastList, {
      props: { cast: mockCast }
    })

    expect(wrapper.text()).toContain('Top Cast')
    expect(wrapper.text()).toContain('Bryan Cranston')
    expect(wrapper.text()).toContain('Walter White')
    expect(wrapper.text()).toContain('Aaron Paul')
    expect(wrapper.text()).toContain('Jesse Pinkman')
    expect(wrapper.findAll('.cast-member-card').length).toBe(2)
  })

  it('does not render if cast array is empty', () => {
    const wrapper = mount(CastList, {
      props: { cast: [] }
    })

    expect(wrapper.find('.cast-section').exists()).toBe(false)
  })
})
