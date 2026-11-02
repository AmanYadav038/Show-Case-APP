import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorState from '../../src/components/common/ErrorState.vue'

describe('ErrorState.vue', () => {
  it('renders default title and message when props are omitted', () => {
    const wrapper = mount(ErrorState)

    expect(wrapper.text()).toContain('Unable to Load Content')
    expect(wrapper.text()).toContain('There was a problem fetching TV show data')
    expect(wrapper.find('.retry-btn').exists()).toBe(true)
  })

  it('renders custom title and message passed via props', () => {
    const wrapper = mount(ErrorState, {
      props: {
        title: 'Failed to Connect',
        message: 'Custom network timeout error occurred.'
      }
    })

    expect(wrapper.find('.error-title').text()).toBe('Failed to Connect')
    expect(wrapper.find('.error-message').text()).toBe('Custom network timeout error occurred.')
  })

  it('emits retry event when the retry button is clicked', async () => {
    const wrapper = mount(ErrorState, {
      props: {
        title: 'Network Error',
        showRetry: true
      }
    })

    const button = wrapper.find('.retry-btn')
    await button.trigger('click')

    expect(wrapper.emitted()).toHaveProperty('retry')
    expect(wrapper.emitted('retry').length).toBe(1)
  })

  it('hides the retry button when showRetry is false', () => {
    const wrapper = mount(ErrorState, {
      props: {
        title: 'Permanent 404',
        showRetry: false
      }
    })

    expect(wrapper.find('.retry-btn').exists()).toBe(false)
  })
})
