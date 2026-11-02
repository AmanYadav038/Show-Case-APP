import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Footer from '../../src/components/layout/Footer.vue'

describe('Footer.vue', () => {
  it('renders brand name, navigation links, and copyright', () => {
    const wrapper = mount(Footer, {
      global: {
        stubs: {
          'router-link': { template: '<a><slot /></a>' }
        }
      }
    })

    expect(wrapper.text()).toContain('ShowCase')
    expect(wrapper.text()).toContain('Dashboard')
    expect(wrapper.text()).toContain('Browse Genres')
    expect(wrapper.text()).toContain('TVMaze API')
  })
})
