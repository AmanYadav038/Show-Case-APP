<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWatchlist } from '../../composables/useWatchlist.js'
import { useDataSaver } from '../../composables/useDataSaver.js'
import { useI18n } from '../../composables/useI18n.js'
import { stripHtml, formatYearRange, formatRuntime, getImageUrl } from '../../utils/formatters.js'
import RatingBadge from '../common/RatingBadge.vue'

const props = defineProps({
  shows: {
    type: Array,
    default: () => []
  }
})

const router = useRouter()
const { isInWatchlist, toggleWatchlist } = useWatchlist()
const { getOptimizedImageUrl } = useDataSaver()
const { t, translateGenre } = useI18n()

const currentIndex = ref(0)
let timer = null

const currentShow = computed(() => {
  if (!props.shows || props.shows.length === 0) return null
  return props.shows[currentIndex.value]
})

const backdropUrl = computed(() => {
  if (!currentShow.value) return null
  return getOptimizedImageUrl(currentShow.value.image, 'original', currentShow.value.name)
})

const yearText = computed(() => {
  if (!currentShow.value) return ''
  return formatYearRange(currentShow.value.premiered, currentShow.value.ended)
})

const runtimeText = computed(() => {
  if (!currentShow.value) return ''
  return formatRuntime(currentShow.value.runtime || currentShow.value.averageRuntime)
})

const synopsis = computed(() => {
  if (!currentShow.value?.summary) return ''
  return stripHtml(currentShow.value.summary, 220)
})

const isBookmarked = computed(() => {
  return currentShow.value ? isInWatchlist(currentShow.value.id) : false
})

function nextSlide() {
  if (props.shows.length <= 1) return
  currentIndex.value = (currentIndex.value + 1) % props.shows.length
}

function setSlide(index) {
  currentIndex.value = index
  resetTimer()
}

function resetTimer() {
  if (timer) clearInterval(timer)
  timer = setInterval(nextSlide, 7500)
}

function goToDetail() {
  if (currentShow.value) {
    router.push({ name: 'show-detail', params: { id: currentShow.value.id } })
  }
}

function handleWatchlistToggle() {
  if (currentShow.value) {
    toggleWatchlist(currentShow.value)
  }
}

onMounted(() => {
  resetTimer()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div v-if="currentShow" class="hero-showcase">
    <!-- Backdrop Image with Dynamic Gradient Layers -->
    <div class="hero-backdrop-container">
      <img
        :key="currentShow.id"
        :src="backdropUrl"
        :alt="currentShow.name"
        class="hero-backdrop-img fade-in"
      />
      <div class="hero-vignette-overlay"></div>
      <div class="hero-bottom-fade"></div>
    </div>

    <!-- Hero Content Overlay -->
    <div class="hero-content container">
      <!-- Spotlight Tag -->
      <div class="spotlight-tag">
        <span class="spotlight-pulse"></span>
        <span>{{ t('hero.spotlight') }}</span>
      </div>

      <!-- Title -->
      <h1 class="hero-title" :key="currentShow.id">
        {{ currentShow.name }}
      </h1>

      <!-- Meta Bar -->
      <div class="hero-meta-bar">
        <RatingBadge :rating="currentShow.rating" size="md" show-max />
        <span class="meta-separator">•</span>
        <span class="meta-year">{{ yearText }}</span>
        <span v-if="runtimeText" class="meta-separator">•</span>
        <span v-if="runtimeText" class="meta-runtime">{{ runtimeText }}</span>
        <span v-if="currentShow.status" class="meta-status">
          {{ currentShow.status }}
        </span>
      </div>

      <!-- Genres -->
      <div v-if="currentShow.genres && currentShow.genres.length" class="hero-genres">
        <span
          v-for="genre in currentShow.genres"
          :key="genre"
          class="hero-genre-pill"
        >
          {{ translateGenre(genre) }}
        </span>
      </div>

      <!-- Synopsis -->
      <p class="hero-synopsis">
        {{ synopsis }}
      </p>

      <!-- Action Buttons -->
      <div class="hero-actions">
        <button class="hero-btn-primary" @click="goToDetail">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span>{{ t('hero.details') }}</span>
        </button>

        <button
          class="hero-btn-secondary"
          :class="{ active: isBookmarked }"
          @click="handleWatchlistToggle"
        >
          <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
          </svg>
          <span>{{ isBookmarked ? t('hero.inWatchlist') : t('hero.addWatchlist') }}</span>
        </button>
      </div>

      <!-- Indicators / Carousel Dots -->
      <div v-if="shows.length > 1" class="hero-indicators">
        <button
          v-for="(_, index) in shows"
          :key="index"
          class="indicator-dot"
          :class="{ active: index === currentIndex }"
          :aria-label="`Go to slide ${index + 1}`"
          @click="setSlide(index)"
        ></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-showcase {
  position: relative;
  width: 100%;
  min-height: 480px;
  max-height: 580px;
  display: flex;
  align-items: center;
  overflow: hidden;
  border-radius: var(--radius-lg);
  margin-bottom: 3rem;
  background: var(--bg-surface);
}

@media (min-width: 1024px) {
  .hero-showcase {
    min-height: 520px;
  }
}

.hero-backdrop-container {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.hero-backdrop-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 25%;
  filter: brightness(0.75);
}

.hero-vignette-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(13, 14, 18, 0.95) 0%,
    rgba(13, 14, 18, 0.8) 45%,
    rgba(13, 14, 18, 0.3) 100%
  );
}

.hero-bottom-fade {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, var(--bg-primary) 0%, transparent 60%);
}

.hero-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 680px;
  padding-top: 2rem;
  padding-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.spotlight-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--accent-gradient-subtle);
  border: 1px solid var(--border-accent);
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  width: fit-content;
}

.spotlight-pulse {
  width: 7px;
  height: 7px;
  background: var(--primary);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--primary);
}

.hero-title {
  font-size: 2.25rem;
  font-weight: 800;
  line-height: 1.15;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

@media (min-width: 768px) {
  .hero-title {
    font-size: 3rem;
  }
}

.hero-meta-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.meta-separator {
  color: var(--text-muted);
}

.meta-year, .meta-runtime {
  font-weight: 600;
}

.meta-status {
  padding: 0.15rem 0.5rem;
  background: rgba(255, 248, 240, 0.08);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.hero-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.hero-genre-pill {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.7rem;
  background: rgba(230, 57, 70, 0.14);
  border: 1px solid rgba(230, 57, 70, 0.28);
  border-radius: var(--radius-full);
  color: var(--accent);
}

.hero-synopsis {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #cbd5e1;
  max-width: 560px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

.hero-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-top: 0.5rem;
}

.hero-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--accent-gradient);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 800;
  padding: 0.75rem 1.45rem;
  border-radius: var(--radius-md);
  box-shadow: 0 4px 20px rgba(230, 57, 70, 0.4);
  transition: all var(--transition-fast);
}

.hero-btn-primary:hover {
  background: var(--accent-gradient-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(230, 57, 70, 0.55);
}

.hero-btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 248, 240, 0.08);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 248, 240, 0.18);
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.75rem 1.35rem;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.hero-btn-secondary:hover {
  background: rgba(255, 248, 240, 0.16);
  transform: translateY(-2px);
}

.hero-btn-secondary.active {
  background: var(--primary-dim);
  border-color: var(--border-accent);
  color: var(--accent);
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.hero-indicators {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.3);
  transition: all var(--transition-fast);
}

.indicator-dot.active {
  width: 24px;
  background: var(--accent-gradient);
}
</style>
