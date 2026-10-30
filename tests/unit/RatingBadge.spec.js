import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RatingBadge from '../../src/components/common/RatingBadge.vue'

describe('RatingBadge.vue', () => {
  it('renders rating value properly when given an average rating object', () => {
    const wrapper = mount(RatingBadge, {
      props: {
        rating: { average: 8.6 },
        size: 'md'
      }
    })

    expect(wrapper.text()).toContain('8.6')
    expect(wrapper.classes()).toContain('badge-md')
  })

  it('renders dash and badge-empty class when rating is missing', () => {
    const wrapper = mount(RatingBadge, {
      props: {
        rating: null,
        size: 'sm'
      }
    })

    expect(wrapper.text()).toContain('—')
    expect(wrapper.classes()).toContain('badge-empty')
    expect(wrapper.classes()).toContain('badge-sm')
  })

  it('renders max value suffix /10 when showMax is true and rating exists', () => {
    const wrapper = mount(RatingBadge, {
      props: {
        rating: { average: 9.2 },
        showMax: true
      }
    })

    expect(wrapper.text()).toContain('9.2')
    expect(wrapper.text()).toContain('/10')
  })
})
