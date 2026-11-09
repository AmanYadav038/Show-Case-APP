import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DataSaverFab from '../../src/components/common/DataSaverFab.vue'
import { useDataSaver } from '../../src/composables/useDataSaver.js'

describe('DataSaverFab component', () => {
  beforeEach(() => {
    const { setDataSaver } = useDataSaver()
    setDataSaver(false)
  })

  it('renders correctly with initial HD mode badge', () => {
    const wrapper = mount(DataSaverFab)
    const button = wrapper.find('.data-saver-fab')
    expect(button.exists()).toBe(true)

    const badge = wrapper.find('.mode-badge')
    expect(badge.text()).toBe('HD')
    expect(wrapper.find('.icon-photo').exists()).toBe(true)
  })

  it('toggles to LITE mode on click and displays informative toast bubble', async () => {
    const wrapper = mount(DataSaverFab)
    const button = wrapper.find('.data-saver-fab')

    await button.trigger('click')

    const badge = wrapper.find('.mode-badge')
    expect(badge.text()).toBe('LITE')
    expect(wrapper.find('.icon-lightning').exists()).toBe(true)

    const toast = wrapper.find('.fab-toast-bubble')
    expect(toast.exists()).toBe(true)
    expect(toast.text()).toContain('Low-Res Mode ON')
  })

  it('toggles back to HD mode on second click', async () => {
    const wrapper = mount(DataSaverFab)
    const button = wrapper.find('.data-saver-fab')

    await button.trigger('click')
    expect(wrapper.find('.mode-badge').text()).toBe('LITE')

    await button.trigger('click')
    expect(wrapper.find('.mode-badge').text()).toBe('HD')
    expect(wrapper.find('.fab-toast-bubble').text()).toContain('High-Res Mode ON')
  })
})
