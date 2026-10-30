<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useHoverPreview } from '../../composables/useHoverPreview.js'
import { useWatchlist } from '../../composables/useWatchlist.js'
import { formatYearRange, getImageUrl } from '../../utils/formatters.js'
import RatingBadge from '../common/RatingBadge.vue'

const props = defineProps({
  show: {
    type: Object,
    required: true
  },
  showRank: {
    type: Number,
    default: null
  }
})

const router = useRouter()
const cardRef = ref(null)
const imageLoaded = ref(false)
const imageError = ref(false)

const { showPreview, hidePreview } = useHoverPreview()
const { isInWatchlist, toggleWatchlist } = useWatchlist()

const posterUrl = computed(() => getImageUrl(props.show.image, 'medium'))
const yearText = computed(() => formatYearRange(props.show.premiered, props.show.ended))
const primaryGenre = computed(() => props.show.genres?.[0] || null)
const isBookmarked = computed(() => isInWatchlist(props.show.id))

function handleMouseEnter() {
  if (cardRef.value) {
    showPreview(props.show, cardRef.value)
  }
}

function handleMouseLeave() {
  hidePreview(false)
}

function handleClick() {
  hidePreview(true)
  router.push({ name: 'show-detail', params: { id: props.show.id } })
}

function handleKeyDown(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    handleClick()
  }
}

function handleWatchlistClick(e) {
  e.stopPropagation()
  toggleWatchlist(props.show)
}
</script>

<template>
  <div
    ref="cardRef"
    class="show-card"
    role="button"
    tabindex="0"
    :aria-label="`${show.name}, rated ${show.rating?.average || 'unrated'}`"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
    @keydown="handleKeyDown"
  >
    <!-- Poster Container -->
    <div class="poster-wrapper">
      <!-- Rank Badge (optional for Top 10 lists) -->
      <span v-if="showRank !== null" class="rank-badge">
        #{{ showRank }}
      </span>

      <!-- Rating Badge overlay -->
      <div class="rating-overlay">
        <RatingBadge :rating="show.rating" size="sm" />
      </div>

      <!-- Quick Watchlist Button -->
      <button 
        class="quick-watchlist-btn"
        :class="{ active: isBookmarked }"
        :title="isBookmarked ? 'In Watchlist' : 'Add to Watchlist'"
        @click="handleWatchlistClick"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
        </svg>
      </button>

      <!-- Image / Poster -->
      <img
        v-if="posterUrl && !imageError"
        :src="posterUrl"
        :alt="show.name"
        class="poster-img"
        loading="lazy"
        @load="imageLoaded = true"
        @error="imageError = true"
      />

      <!-- Fallback when image is missing or failed to load -->
      <div v-else class="poster-fallback">
        <svg class="fallback-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
          <polyline points="17 2 12 7 7 2" />
        </svg>
        <span class="fallback-text">{{ show.name }}</span>
      </div>

      <!-- Subtle gradient shadow -->
      <div class="poster-shadow-overlay"></div>
    </div>

    <!-- Metadata Below Poster -->
    <div class="card-meta">
      <div class="meta-row">
        <span class="meta-year">{{ yearText }}</span>
        <span v-if="primaryGenre" class="meta-genre">{{ primaryGenre }}</span>
      </div>
      <h3 class="show-title" :title="show.name">
        {{ show.name }}
      </h3>
    </div>
  </div>
</template>

<style scoped>
.show-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  cursor: pointer;
  outline: none;
  transition: transform var(--transition-normal), border-color var(--transition-normal), box-shadow var(--transition-normal);
  user-select: none;
}

.show-card:hover {
  transform: translateY(-4px);
  border-color: var(--border-light);
  box-shadow: var(--shadow-md);
}

.show-card:focus-visible {
  border-color: var(--accent-gold);
  box-shadow: 0 0 0 2px var(--accent-gold);
}

.poster-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  background: var(--bg-surface);
  overflow: hidden;
}

.poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-bounce);
}

.show-card:hover .poster-img {
  transform: scale(1.04);
}

.poster-shadow-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(13, 14, 18, 0.7) 0%, transparent 40%);
  pointer-events: none;
}

.poster-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  background: linear-gradient(135deg, #1c1e28, #13141c);
  color: var(--text-muted);
  text-align: center;
}

.fallback-icon {
  width: 38px;
  height: 38px;
  opacity: 0.6;
}

.fallback-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  line-height: 1.25;
}

.rating-overlay {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
}

.rank-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 3;
  background: var(--accent-gold);
  color: #000;
  font-weight: 800;
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
  line-height: 1;
}

.quick-watchlist-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  color: rgba(255, 255, 255, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.85);
  transition: all var(--transition-fast);
}

.quick-watchlist-btn svg {
  width: 16px;
  height: 16px;
}

.quick-watchlist-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  color: #fff;
  transform: scale(1);
}

.quick-watchlist-btn.active {
  opacity: 1;
  transform: scale(1);
  color: var(--accent-gold);
  background: rgba(0, 0, 0, 0.85);
}

.show-card:hover .quick-watchlist-btn {
  opacity: 1;
  transform: scale(1);
}

.card-meta {
  padding: 0.85rem 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.meta-year {
  font-weight: 600;
}

.meta-genre {
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.show-title {
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color var(--transition-fast);
}

.show-card:hover .show-title {
  color: var(--accent-gold);
}
</style>
