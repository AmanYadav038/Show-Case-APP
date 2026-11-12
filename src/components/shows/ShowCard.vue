<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useHoverPreview } from '../../composables/useHoverPreview.js'
import { useWatchlist } from '../../composables/useWatchlist.js'
import { useDataSaver } from '../../composables/useDataSaver.js'
import { useI18n } from '../../composables/useI18n.js'
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
const { getOptimizedImageUrl } = useDataSaver()
const { t, translateGenre } = useI18n()

const posterUrl = computed(() => getOptimizedImageUrl(props.show.image, 'medium', props.show.name))
const yearText = computed(() => formatYearRange(props.show.premiered, props.show.ended))
const primaryGenre = computed(() => props.show.genres?.[0] || null)
const isBookmarked = computed(() => isInWatchlist(props.show.id))

function handleMouseEnter() {
  if (typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(hover: hover)').matches) {
    return
  }
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
  >
    <!-- Poster Container -->
    <div class="poster-wrapper">
      <!-- Rank Badge (shown on Top-Left when showRank is present) -->
      <div v-if="showRank !== null" class="rank-badge">
        <span class="rank-hash">#</span>{{ showRank }}
      </div>

      <!-- Rating Badge overlay: placed at bottom-left if rank is present, else top-left -->
      <div 
        class="rating-overlay"
        :class="{ 'rating-bottom': showRank !== null, 'rating-top': showRank === null }"
      >
        <RatingBadge :rating="show.rating" size="sm" />
      </div>

      <!-- Quick Watchlist Button (Top-Right) -->
      <button 
        class="quick-watchlist-btn"
        :class="{ active: isBookmarked }"
        :title="isBookmarked ? t('hero.inWatchlist') : t('hero.addWatchlist')"
        :aria-label="isBookmarked ? t('hero.inWatchlist') : t('hero.addWatchlist')"
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

      <!-- Gradient overlay for contrast -->
      <div class="poster-shadow-overlay"></div>
    </div>

    <!-- Metadata Below Poster -->
    <div class="card-meta">
      <div class="meta-row">
        <span class="meta-year">{{ yearText }}</span>
        <span v-if="primaryGenre" class="meta-genre">{{ translateGenre(primaryGenre) }}</span>
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
  transform: translateY(-5px);
  border-color: var(--border-accent);
  box-shadow: var(--shadow-md), 0 0 15px rgba(230, 57, 70, 0.25);
}

.show-card:focus-visible {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.35);
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

.poster-img[src*="play"],
.poster-img[src*="placeholder"] {
  object-fit: contain;
  padding: 2.5rem;
  background: linear-gradient(135deg, #241c1d 0%, #171213 100%);
}

.show-card:hover .poster-img {
  transform: scale(1.05);
}

.poster-shadow-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(21, 19, 19, 0.9) 0%, rgba(21, 19, 19, 0.2) 35%, transparent 60%);
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
  background: linear-gradient(135deg, #2e2323, #1c1616);
  color: var(--text-muted);
  text-align: center;
}

.fallback-icon {
  width: 38px;
  height: 38px;
  color: var(--primary);
  opacity: 0.8;
}

.fallback-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  line-height: 1.25;
}

/* Rank Badge - Vibrant modern gradient badge at top left */
.rank-badge {
  position: absolute;
  top: 9px;
  left: 9px;
  z-index: 3;
  background: var(--accent-gradient);
  color: #fff;
  font-weight: 800;
  font-size: 0.78rem;
  padding: 0.25rem 0.55rem;
  border-radius: var(--radius-sm);
  line-height: 1;
  box-shadow: 0 4px 12px rgba(230, 57, 70, 0.45);
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 1px;
}

.rank-hash {
  font-size: 0.68rem;
  opacity: 0.85;
}

/* Rating Overlay - Top-left when unranked, Bottom-left when ranked */
.rating-overlay {
  position: absolute;
  z-index: 2;
  transition: transform var(--transition-fast);
}

.rating-overlay.rating-top {
  top: 9px;
  left: 9px;
}

.rating-overlay.rating-bottom {
  bottom: 9px;
  left: 9px;
}

/* Quick Watchlist Button */
.quick-watchlist-btn {
  position: absolute;
  top: 9px;
  right: 9px;
  z-index: 3;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(21, 19, 19, 0.75);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 248, 240, 0.14);
  color: rgba(255, 248, 240, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.85);
  transition: all var(--transition-fast);
}

.quick-watchlist-btn svg {
  width: 15px;
  height: 15px;
}

.quick-watchlist-btn:hover {
  background: rgba(21, 19, 19, 0.95);
  color: #fff;
  border-color: var(--accent);
  transform: scale(1);
}

.quick-watchlist-btn.active {
  opacity: 1;
  transform: scale(1);
  color: #fff;
  background: var(--accent-gradient);
  border-color: transparent;
  box-shadow: 0 2px 10px rgba(230, 57, 70, 0.45);
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
  font-weight: 600;
  padding: 0.12rem 0.45rem;
  background: rgba(230, 57, 70, 0.15);
  border: 1px solid rgba(230, 57, 70, 0.28);
  border-radius: var(--radius-sm);
  color: var(--accent);
}

.show-title {
  font-size: 0.94rem;
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
  color: var(--accent);
}
</style>
