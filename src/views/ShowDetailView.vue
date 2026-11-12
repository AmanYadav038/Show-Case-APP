<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchShowDetails } from '../services/tvmazeApi.js'
import { useShows } from '../composables/useShows.js'
import { useWatchlist } from '../composables/useWatchlist.js'
import { useDataSaver } from '../composables/useDataSaver.js'
import { useI18n } from '../composables/useI18n.js'
import {
  stripHtml,
  formatRating,
  formatYearRange,
  formatRuntime,
  formatSchedule
} from '../utils/formatters.js'

import RatingBadge from '../components/common/RatingBadge.vue'
import CastList from '../components/shows/CastList.vue'
import EpisodeList from '../components/shows/EpisodeList.vue'
import GenreRow from '../components/shows/GenreRow.vue'
import LoadingSkeleton from '../components/common/LoadingSkeleton.vue'
import ErrorState from '../components/common/ErrorState.vue'

const props = defineProps({
  id: {
    type: [String, Number],
    required: true
  }
})

const route = useRoute()
const router = useRouter()
const { shows, loadShows } = useShows()
const { isInWatchlist, toggleWatchlist } = useWatchlist()
const { getOptimizedImageUrl } = useDataSaver()
const { t, translateGenre } = useI18n()

const show = ref(null)
const loading = ref(true)
const error = ref(null)

const isBookmarked = computed(() => {
  return show.value ? isInWatchlist(show.value.id) : false
})

const posterUrl = computed(() => {
  return getOptimizedImageUrl(show.value?.image, 'medium', show.value?.name)
})

const backdropUrl = computed(() => {
  return getOptimizedImageUrl(show.value?.image, 'original', show.value?.name)
})

const yearText = computed(() => {
  return formatYearRange(show.value?.premiered, show.value?.ended)
})

const runtimeText = computed(() => {
  return formatRuntime(show.value?.runtime || show.value?.averageRuntime)
})

const scheduleText = computed(() => {
  return formatSchedule(show.value?.schedule)
})

const networkText = computed(() => {
  if (show.value?.network) {
    const net = show.value.network.name
    const country = show.value.network.country?.name
    return country ? `${net} (${country})` : net
  }
  if (show.value?.webChannel) {
    return show.value.webChannel.name
  }
  return null
})

const fullSummary = computed(() => {
  return stripHtml(show.value?.summary)
})

const embeddedCast = computed(() => {
  return show.value?._embedded?.cast || []
})

const embeddedEpisodes = computed(() => {
  return show.value?._embedded?.episodes || []
})

// Recommendations: similar shows sharing at least one genre
const similarShows = computed(() => {
  if (!show.value || !shows.value.length) return []
  const currentGenres = show.value.genres || []
  if (!currentGenres.length) return []

  return shows.value
    .filter(s => s.id !== show.value.id && s.genres?.some(g => currentGenres.includes(g)))
    .slice(0, 15)
})

async function fetchDetails() {
  loading.value = true
  error.value = null
  try {
    const data = await fetchShowDetails(props.id)
    show.value = data
    document.title = `${data.name} — ShowCase`
  } catch (err) {
    error.value = err.message || 'Unable to load show details.'
  } finally {
    loading.value = false
  }
}

function goBack() {
  if (window.history.length > 2) {
    router.back()
  } else {
    router.push('/')
  }
}

function handleWatchlistToggle() {
  if (show.value) {
    toggleWatchlist(show.value)
  }
}

onMounted(() => {
  fetchDetails()
  loadShows() // Ensure general shows are loaded for recommendations
})

watch(() => props.id, () => {
  fetchDetails()
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<template>
  <main class="show-detail-page">
    <!-- Loading State -->
    <template v-if="loading">
      <LoadingSkeleton type="detail" />
    </template>

    <!-- Error State -->
    <template v-else-if="error">
      <div class="container error-wrap">
        <ErrorState
          :title="t('showDetail.notFound')"
          :message="error"
          @retry="fetchDetails"
        />
        <button class="back-link-btn" @click="goBack">
          ← {{ t('showDetail.back') }}
        </button>
      </div>
    </template>

    <!-- Show Content -->
    <template v-else-if="show">
      <!-- Backdrop Banner -->
      <div class="backdrop-wrapper">
        <img
          v-if="backdropUrl"
          :src="backdropUrl"
          :alt="show.name"
          class="backdrop-img"
        />
        <div class="backdrop-gradient-left"></div>
        <div class="backdrop-gradient-bottom"></div>
      </div>

      <!-- Main Container -->
      <div class="container detail-content">
        <!-- Back Button -->
        <button class="back-nav-btn" @click="goBack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>{{ t('showDetail.back') }}</span>
        </button>

        <!-- Hero Header Card -->
        <div class="detail-header-card">
          <!-- Poster -->
          <div class="detail-poster-wrap">
            <img
              v-if="posterUrl"
              :src="posterUrl"
              :alt="show.name"
              class="detail-poster-img"
            />
            <div v-else class="detail-poster-fallback">
              <span>📺</span>
            </div>

            <!-- Quick Watchlist button on poster -->
            <button
              class="poster-watchlist-btn"
              :class="{ active: isBookmarked }"
              @click="handleWatchlistToggle"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
              </svg>
              <span>{{ isBookmarked ? t('showDetail.inWatchlist') : t('showDetail.addWatchlist') }}</span>
            </button>
          </div>

          <!-- Main Info -->
          <div class="detail-info-main">
            <!-- Title & Status -->
            <div class="title-status-row">
              <h1 class="show-main-title">{{ show.name }}</h1>
              <span v-if="show.status" class="status-tag" :class="show.status.toLowerCase()">
                {{ show.status }}
              </span>
            </div>

            <!-- Meta attributes -->
            <div class="detail-meta-row">
              <RatingBadge :rating="show.rating" size="lg" show-max />
              <span class="meta-dot">•</span>
              <span class="meta-text">{{ yearText }}</span>
              <span v-if="runtimeText" class="meta-dot">•</span>
              <span v-if="runtimeText" class="meta-text">{{ runtimeText }}</span>
              <span v-if="show.type" class="meta-dot">•</span>
              <span v-if="show.type" class="meta-text">{{ show.type }}</span>
            </div>

            <!-- Genre pills -->
            <div v-if="show.genres && show.genres.length" class="genre-pill-group">
              <span
                v-for="genre in show.genres"
                :key="genre"
                class="genre-chip"
              >
                {{ translateGenre(genre) }}
              </span>
            </div>

            <!-- Synopsis -->
            <div class="detail-synopsis-box">
              <h3 class="synopsis-heading">{{ t('showDetail.synopsis') }}</h3>
              <p class="synopsis-paragraph">
                {{ fullSummary || t('showDetail.noSynopsis') }}
              </p>
            </div>

            <!-- Specification Grid -->
            <div class="specs-grid">
              <div v-if="networkText" class="spec-item">
                <span class="spec-label">{{ t('showDetail.network') }}</span>
                <span class="spec-value">{{ networkText }}</span>
              </div>
              <div v-if="scheduleText" class="spec-item">
                <span class="spec-label">{{ t('showDetail.schedule') }}</span>
                <span class="spec-value">{{ scheduleText }}</span>
              </div>
              <div v-if="show.language" class="spec-item">
                <span class="spec-label">{{ t('showDetail.language') }}</span>
                <span class="spec-value">{{ show.language }}</span>
              </div>
              <div v-if="show.premiered" class="spec-item">
                <span class="spec-label">{{ t('showDetail.premiered') }}</span>
                <span class="spec-value">{{ show.premiered }}</span>
              </div>
            </div>

            <!-- Links Bar -->
            <div class="action-links-bar">
              <a
                v-if="show.officialSite"
                :href="show.officialSite"
                target="_blank"
                rel="noopener noreferrer"
                class="external-site-btn"
              >
                <span>{{ t('showDetail.officialSite') }}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>

              <a
                :href="`https://www.tvmaze.com/shows/${show.id}`"
                target="_blank"
                rel="noopener noreferrer"
                class="tvmaze-link-btn"
              >
                <span>{{ t('showDetail.tvmaze') }}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <!-- Cast Section -->
        <CastList :cast="embeddedCast" />

        <!-- Episodes Section -->
        <EpisodeList :episodes="embeddedEpisodes" />

        <!-- More Like This Row -->
        <div v-if="similarShows.length" class="similar-shows-row">
          <GenreRow
            :title="t('showDetail.moreLikeThis')"
            :shows="similarShows"
          />
        </div>
      </div>
    </template>
  </main>
</template>

<style scoped>
.show-detail-page {
  position: relative;
  min-height: 100vh;
  padding-bottom: 4rem;
}

.backdrop-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 480px;
  overflow: hidden;
  z-index: 1;
}

.backdrop-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 20%;
  filter: blur(2px) brightness(0.4);
  transform: scale(1.05);
}

.backdrop-img[src*="play"],
.backdrop-img[src*="placeholder"] {
  object-fit: contain;
  padding: 4rem;
  background: radial-gradient(circle at center, #2e1d20 0%, #141011 80%);
}

.backdrop-gradient-left {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, var(--bg-primary) 0%, rgba(13, 14, 18, 0.7) 50%, var(--bg-primary) 100%);
}

.backdrop-gradient-bottom {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, var(--bg-primary) 0%, transparent 80%);
}

.detail-content {
  position: relative;
  z-index: 2;
  padding-top: 1.5rem;
}

.back-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-secondary);
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  padding: 0.45rem 0.9rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-subtle);
  margin-bottom: 1.5rem;
  transition: all var(--transition-fast);
}

.back-nav-btn:hover {
  color: var(--accent);
  border-color: var(--border-accent);
  transform: translateX(-3px);
}

.back-nav-btn svg {
  width: 16px;
  height: 16px;
}

.detail-header-card {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1.75rem;
  box-shadow: var(--shadow-lg);
}

@media (min-width: 860px) {
  .detail-header-card {
    flex-direction: row;
    align-items: flex-start;
    padding: 2.25rem;
  }
}

.detail-poster-wrap {
  position: relative;
  width: 100%;
  max-width: 280px;
  margin: 0 auto;
  aspect-ratio: 2 / 3;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  background: var(--bg-card);
  flex-shrink: 0;
}

@media (min-width: 860px) {
  .detail-poster-wrap {
    width: 280px;
    margin: 0;
  }
}

.detail-poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-poster-img[src*="play"],
.detail-poster-img[src*="placeholder"] {
  object-fit: contain;
  padding: 2.5rem;
  background: linear-gradient(135deg, #241c1d 0%, #171213 100%);
}

.detail-poster-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  background: #362a2a;
}

.poster-watchlist-btn {
  position: absolute;
  bottom: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(21, 19, 19, 0.88);
  backdrop-filter: blur(10px);
  color: var(--text-primary);
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0.65rem 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 248, 240, 0.15);
  transition: all var(--transition-fast);
}

.poster-watchlist-btn:hover {
  background: rgba(41, 32, 32, 0.95);
  border-color: var(--accent);
}

.poster-watchlist-btn.active {
  background: var(--accent-gradient);
  color: #fff;
  border-color: transparent;
}

.poster-watchlist-btn svg {
  width: 16px;
  height: 16px;
}

.detail-info-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-width: 0;
}

.title-status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.show-main-title {
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  line-height: 1.15;
}

@media (min-width: 640px) {
  .show-main-title {
    font-size: 2.75rem;
  }
}

.status-tag {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.3rem 0.75rem;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
}

.status-tag.running {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-tag.ended {
  background: rgba(148, 163, 184, 0.15);
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.detail-meta-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.meta-dot {
  color: var(--text-muted);
}

.meta-text {
  font-weight: 600;
}

.genre-pill-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.genre-chip {
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.3rem 0.8rem;
  background: rgba(230, 57, 70, 0.15);
  border: 1px solid rgba(230, 57, 70, 0.28);
  border-radius: var(--radius-full);
  color: var(--accent);
}

.detail-synopsis-box {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.synopsis-heading {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.synopsis-paragraph {
  font-size: 0.95rem;
  line-height: 1.7;
  color: #c4c9d8;
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 1.25rem;
}

.spec-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.spec-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: var(--text-muted);
}

.spec-value {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-primary);
}

.action-links-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-top: 0.5rem;
}

.external-site-btn,
.tvmaze-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.6rem 1.15rem;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.external-site-btn {
  background: var(--accent-gradient);
  color: #fff;
}

.external-site-btn:hover {
  background: var(--accent-gradient-hover);
  transform: translateY(-1px);
}

.tvmaze-link-btn {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}

.tvmaze-link-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.external-site-btn svg,
.tvmaze-link-btn svg {
  width: 14px;
  height: 14px;
}

.similar-shows-row {
  margin-top: 3.5rem;
}

.error-wrap {
  padding-top: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.back-link-btn {
  color: var(--accent);
  font-weight: 700;
  margin-top: 1rem;
}
</style>
