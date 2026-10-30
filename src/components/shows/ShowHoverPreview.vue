<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useHoverPreview } from '../../composables/useHoverPreview.js'
import { useWatchlist } from '../../composables/useWatchlist.js'
import { stripHtml, formatYearRange, formatRuntime, getImageUrl } from '../../utils/formatters.js'
import RatingBadge from '../common/RatingBadge.vue'

const router = useRouter()
const { activeShow, anchorRect, isVisible, hidePreview, keepPreviewOpen } = useHoverPreview()
const { isInWatchlist, toggleWatchlist } = useWatchlist()

const cardRef = ref(null)

const positionStyle = computed(() => {
  if (!anchorRect.value) return { display: 'none' }

  const rect = anchorRect.value
  const cardWidth = 320
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  // Center horizontally relative to anchor card
  let left = rect.left + (rect.width / 2) - (cardWidth / 2)
  
  // Guard horizontal screen boundaries
  const padding = 16
  if (left < padding) {
    left = padding
  } else if (left + cardWidth > viewportWidth - padding) {
    left = viewportWidth - cardWidth - padding
  }

  // Vertical placement: prefer above the card, but if close to top of screen, place below
  const previewHeight = 360
  let top
  if (rect.top - previewHeight - 12 > 70) {
    // Show above
    top = rect.top - previewHeight - 8
  } else {
    // Show below
    top = rect.bottom + 8
  }

  // Ensure top doesn't overflow bottom
  if (top + previewHeight > viewportHeight - padding) {
    top = Math.max(70, viewportHeight - previewHeight - padding)
  }

  return {
    top: `${top}px`,
    left: `${left}px`,
    width: `${cardWidth}px`
  }
})

const synopsis = computed(() => {
  if (!activeShow.value?.summary) return 'No synopsis available.'
  return stripHtml(activeShow.value.summary, 125)
})

const posterSrc = computed(() => {
  return getImageUrl(activeShow.value?.image, 'medium')
})

const yearText = computed(() => {
  return formatYearRange(activeShow.value?.premiered, activeShow.value?.ended)
})

const runtimeText = computed(() => {
  return formatRuntime(activeShow.value?.runtime || activeShow.value?.averageRuntime)
})

const isBookmarked = computed(() => {
  return activeShow.value ? isInWatchlist(activeShow.value.id) : false
})

function goToDetail() {
  if (activeShow.value) {
    const id = activeShow.value.id
    hidePreview(true)
    router.push({ name: 'show-detail', params: { id } })
  }
}

function handleWatchlistToggle() {
  if (activeShow.value) {
    toggleWatchlist(activeShow.value)
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="popover-fade">
      <div
        v-if="isVisible && activeShow"
        ref="cardRef"
        class="hover-popover-card"
        :style="positionStyle"
        @mouseenter="keepPreviewOpen"
        @mouseleave="hidePreview(false)"
      >
        <!-- Card Backdrop / Header -->
        <div class="popover-header">
          <div class="popover-poster-wrap">
            <img 
              v-if="posterSrc" 
              :src="posterSrc" 
              :alt="activeShow.name" 
              class="popover-poster-img"
              loading="lazy"
            />
            <div v-else class="popover-poster-fallback">
              <span>📺</span>
            </div>
          </div>

          <div class="popover-header-info">
            <h4 class="popover-title" :title="activeShow.name">
              {{ activeShow.name }}
            </h4>
            
            <div class="popover-meta">
              <RatingBadge :rating="activeShow.rating" size="sm" />
              <span class="meta-dot">•</span>
              <span class="meta-year">{{ yearText }}</span>
              <span v-if="runtimeText" class="meta-dot">•</span>
              <span v-if="runtimeText" class="meta-runtime">{{ runtimeText }}</span>
            </div>

            <div v-if="activeShow.status" class="status-chip" :class="activeShow.status.toLowerCase()">
              {{ activeShow.status }}
            </div>
          </div>
        </div>

        <!-- Genres -->
        <div v-if="activeShow.genres && activeShow.genres.length" class="popover-genres">
          <span 
            v-for="genre in activeShow.genres.slice(0, 3)" 
            :key="genre" 
            class="genre-pill"
          >
            {{ genre }}
          </span>
        </div>

        <!-- Synopsis snippet -->
        <p class="popover-synopsis">
          {{ synopsis }}
        </p>

        <!-- Actions -->
        <div class="popover-actions">
          <button class="action-btn-primary" @click="goToDetail">
            <span>View Details</span>
            <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </button>

          <button 
            class="action-btn-icon" 
            :class="{ active: isBookmarked }"
            :title="isBookmarked ? 'Remove from Watchlist' : 'Add to Watchlist'"
            @click.stop="handleWatchlistToggle"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.hover-popover-card {
  position: fixed;
  z-index: 9999;
  background: #111422;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.8), 0 0 25px rgba(99, 102, 241, 0.25);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: auto;
  color: var(--text-primary);
  backdrop-filter: blur(16px);
}

.popover-header {
  display: flex;
  gap: 0.85rem;
}

.popover-poster-wrap {
  width: 72px;
  height: 104px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
}

.popover-poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.popover-poster-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: #242735;
}

.popover-header-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.35rem;
  min-width: 0;
}

.popover-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.25;
}

.popover-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.meta-dot {
  color: var(--text-muted);
}

.meta-year, .meta-runtime {
  font-weight: 500;
}

.status-chip {
  align-self: flex-start;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.status-chip.running {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.status-chip.ended {
  background: rgba(148, 163, 184, 0.15);
  color: #cbd5e1;
}

.popover-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.genre-pill {
  font-size: 0.7rem;
  font-weight: 500;
  padding: 0.18rem 0.5rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.popover-synopsis {
  font-size: 0.82rem;
  line-height: 1.45;
  color: #b0b7c7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.popover-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.25rem;
}

.action-btn-primary {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background: var(--accent-gradient);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.55rem 0.85rem;
  border-radius: var(--radius-sm);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
  transition: all var(--transition-fast);
}

.action-btn-primary:hover {
  background: var(--accent-gradient-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.5);
}

.btn-arrow {
  width: 14px;
  height: 14px;
}

.action-btn-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.action-btn-icon svg {
  width: 18px;
  height: 18px;
}

.action-btn-icon:hover {
  background: rgba(255, 255, 255, 0.15);
  color: var(--text-primary);
}

.action-btn-icon.active {
  background: var(--accent-gradient);
  color: #fff;
}

/* Transitions */
.popover-fade-enter-active,
.popover-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.popover-fade-enter-from,
.popover-fade-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(4px);
}
</style>
