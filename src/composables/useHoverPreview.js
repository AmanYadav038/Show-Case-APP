import { ref } from 'vue'

const activeShow = ref(null)
const anchorRect = ref(null)
const isVisible = ref(false)

let openTimer = null
let closeTimer = null

export function useHoverPreview() {
  function showPreview(show, element) {
    if (!show || !element) return

    clearTimeout(closeTimer)
    clearTimeout(openTimer)

    openTimer = setTimeout(() => {
      const rect = element.getBoundingClientRect()
      anchorRect.value = rect
      activeShow.value = show
      isVisible.value = true
    }, 250) // 250ms debounce for natural feel
  }

  function hidePreview(immediate = false) {
    clearTimeout(openTimer)
    if (immediate) {
      isVisible.value = false
      activeShow.value = null
      anchorRect.value = null
      return
    }

    closeTimer = setTimeout(() => {
      isVisible.value = false
      activeShow.value = null
      anchorRect.value = null
    }, 200)
  }

  function keepPreviewOpen() {
    clearTimeout(closeTimer)
  }

  return {
    activeShow,
    anchorRect,
    isVisible,
    showPreview,
    hidePreview,
    keepPreviewOpen
  }
}
