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

      <!-- Controls: View All Link & Arrow Navigation -->
      <div class="header-right">
        <!-- View All Component / Button -->
        <router-link
          :to="{ name: 'genre-detail', params: { genre: genreKey || 'Drama' } }"
          class="view-all-link"
          :title="`View all ${title}`"
        >
          <span>View All</span>
          <svg class="view-all-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </router-link>

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
  margin-bottom: 3rem;
  position: relative;
}

.row-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
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
  background: var(--accent-gradient);
  border-radius: var(--radius-full);
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
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
  color: #c7d2fe;
  background: rgba(99, 102, 241, 0.12);
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* View All Component Link */
.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: #a5b4fc;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.25);
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
}

.view-all-link:hover {
  background: var(--accent-gradient);
  color: #fff;
  border-color: transparent;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.view-all-arrow {
  width: 14px;
  height: 14px;
  transition: transform var(--transition-fast);
}

.view-all-link:hover .view-all-arrow {
  transform: translateX(2px);
}

.nav-controls {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.nav-arrow-btn {
  width: 32px;
  height: 32px;
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
  width: 15px;
  height: 15px;
}

.nav-arrow-btn:hover:not(:disabled) {
  background: var(--accent-gradient);
  color: #fff;
  border-color: transparent;
  transform: scale(1.08);
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
}

.nav-arrow-btn:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}

.scroll-track-wrapper {
  position: relative;
  margin: 0 -0.5rem;
  padding: 0 0.5rem;
}

.horizontal-scroll-track {
  display: flex;
  gap: 1.25rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  padding-bottom: 0.75rem;
  -webkit-overflow-scrolling: touch;
}

.horizontal-scroll-track::-webkit-scrollbar {
  height: 5px;
}

.horizontal-scroll-track::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
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
    flex: 0 0 215px;
  }
}
</style>
