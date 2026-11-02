import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSkeleton from '../../src/components/common/LoadingSkeleton.vue'

describe('LoadingSkeleton.vue', () => {
  it('renders row skeleton by default with default count of 6 cards', () => {
    const wrapper = mount(LoadingSkeleton)

    expect(wrapper.find('.skeleton-row-container').exists()).toBe(true)
    expect(wrapper.findAll('.skeleton-card').length).toBe(6)
  })

  it('renders hero skeleton when type is hero', () => {
    const wrapper = mount(LoadingSkeleton, {
      props: { type: 'hero' }
    })

    expect(wrapper.find('.skeleton-hero').exists()).toBe(true)
    expect(wrapper.find('.skeleton-hero-backdrop').exists()).toBe(true)
  })

  it('renders grid skeleton with custom count', () => {
    const wrapper = mount(LoadingSkeleton, {
      props: {
        type: 'grid',
        count: 10
      }
    })

    expect(wrapper.find('.grid-cards').exists()).toBe(true)
    expect(wrapper.findAll('.skeleton-card').length).toBe(10)
  })

  it('renders detail skeleton when type is detail', () => {
    const wrapper = mount(LoadingSkeleton, {
      props: { type: 'detail' }
    })

    expect(wrapper.find('.skeleton-detail').exists()).toBe(true)
    expect(wrapper.find('.skeleton-detail-poster').exists()).toBe(true)
  })
})
