<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import ShowCard from './ShowCard.vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  shows: {
    type: Array,
    required: true
  },
  genreKey: {
    type: String,
    default: ''
  },
  isRanked: {
    type: Boolean,
    default: false
  }
})

const scrollContainer = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

function checkScrollBounds() {
  const el = scrollContainer.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 10
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 10
}

function scroll(direction) {
  const el = scrollContainer.value
  if (!el) return
  const scrollDistance = el.clientWidth * 0.75
  el.scrollBy({
    left: direction === 'left' ? -scrollDistance : scrollDistance,
    behavior: 'smooth'
  })
}

onMounted(() => {
  nextTick(() => {
    checkScrollBounds()
    window.addEventListener('resize', checkScrollBounds)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScrollBounds)
})
</script>

<template>
  <section v-if="shows && shows.length" :id="genreKey ? `genre-${genreKey.toLowerCase()}` : undefined" class="genre-row-section">
    <!-- Row Header -->
    <div class="row-header">
      <div class="header-left">
        <div class="header-accent-bar"></div>
        <h2 class="genre-title">{{ title }}</h2>
        <span class="show-count-badge">{{ shows.length }} shows</span>
      </div>

      <!-- Arrow Navigation Buttons -->
      <div class="nav-controls">
        <button
          class="nav-arrow-btn"
          :disabled="!canScrollLeft"
          aria-label="Scroll left"
          @click="scroll('left')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          class="nav-arrow-btn"
          :disabled="!canScrollRight"
          aria-label="Scroll right"
          @click="scroll('right')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Scroll Track Wrapper -->
    <div class="scroll-track-wrapper">
      <div
        ref="scrollContainer"
        class="horizontal-scroll-track"
        @scroll.passive="checkScrollBounds"
      >
        <div
          v-for="(show, index) in shows"
          :key="show.id"
          class="track-item"
        >
          <ShowCard 
            :show="show" 
            :show-rank="isRanked ? index + 1 : null" 
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.genre-row-section {
  margin-bottom: 2.75rem;
  position: relative;
}

.row-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.15rem;
  padding: 0 0.25rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-accent-bar {
  width: 4px;
  height: 24px;
  background: var(--accent-gold);
  border-radius: var(--radius-full);
}

.genre-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.show-count-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.06);
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-subtle);
}

.nav-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-arrow-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.nav-arrow-btn svg {
  width: 16px;
  height: 16px;
}

.nav-arrow-btn:hover:not(:disabled) {
  background: var(--accent-gold);
  color: #000;
  border-color: var(--accent-gold);
  transform: scale(1.05);
}

.nav-arrow-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.scroll-track-wrapper {
  position: relative;
  margin: 0 -0.5rem;
  padding: 0 0.5rem;
}

.horizontal-scroll-track {
  display: flex;
  gap: 1.15rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  padding-bottom: 0.75rem;
  -webkit-overflow-scrolling: touch;
}

/* Hide scrollbar on track for a clean carousel look */
.horizontal-scroll-track::-webkit-scrollbar {
  height: 5px;
}

.horizontal-scroll-track::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.track-item {
  flex: 0 0 160px;
  scroll-snap-align: start;
}

@media (min-width: 640px) {
  .track-item {
    flex: 0 0 185px;
  }
}

@media (min-width: 1024px) {
  .track-item {
    flex: 0 0 210px;
  }
}
</style>
