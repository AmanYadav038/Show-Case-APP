<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useShows, CURATED_GENRES } from '../composables/useShows.js'
import { useI18n } from '../composables/useI18n.js'
import ShowCard from '../components/shows/ShowCard.vue'
import LoadingSkeleton from '../components/common/LoadingSkeleton.vue'
import ErrorState from '../components/common/ErrorState.vue'

const props = defineProps({
  genre: {
    type: String,
    required: true
  }
})

const route = useRoute()
const router = useRouter()
const {
  shows,
  loading,
  error,
  isLoaded,
  loadShows,
  loadMoreShowsForGenre,
  isLoadingMore,
  loadMoreError
} = useShows()

const { t, translateGenre } = useI18n()

const currentGenre = ref(props.genre || 'Drama')
const sortBy = ref('rating') // 'rating' | 'popularity' | 'year' | 'name'

// Extra shows loaded on-demand specifically for the active genre view (not cached globally)
const extraShows = ref([])
const currentGenrePage = ref(0)
const hasMoreGenre = ref(true)
const loadMoreMessage = ref('')
let feedbackTimer = null

// Reset genre-specific extra shows and pagination when switching genre
function resetGenreExtra() {
  extraShows.value = []
  currentGenrePage.value = 0
  hasMoreGenre.value = true
  loadMoreMessage.value = ''
  if (feedbackTimer) clearTimeout(feedbackTimer)
}

async function handleLoadMore() {
  if (isLoadingMore.value || !hasMoreGenre.value) return
  if (feedbackTimer) clearTimeout(feedbackTimer)

  const existingIds = new Set(genreShows.value.map(s => s.id))
  const nextPageToFetch = currentGenrePage.value + 1

  const { newShows, lastPage, hasMore } = await loadMoreShowsForGenre(
    currentGenre.value,
    nextPageToFetch,
    existingIds
  )

  currentGenrePage.value = lastPage
  hasMoreGenre.value = hasMore

  if (newShows && newShows.length > 0) {
    extraShows.value = [...extraShows.value, ...newShows]
    loadMoreMessage.value = t('genreView.loadedMoreToast', {
      count: newShows.length,
      genre: translateGenre(currentGenre.value)
    })
    feedbackTimer = setTimeout(() => {
      loadMoreMessage.value = ''
    }, 4000)
  } else if (!hasMore) {
    loadMoreMessage.value = t('genreView.allLoaded', {
      genre: translateGenre(currentGenre.value)
    })
  } else {
    loadMoreMessage.value = `Checked next catalog batch; no new ${translateGenre(currentGenre.value)} shows in that slice. Click again to search deeper.`
    feedbackTimer = setTimeout(() => {
      loadMoreMessage.value = ''
    }, 5000)
  }
}

// All available genre choices including 'Top-Rated'
const allGenres = computed(() => {
  return ['Top-Rated', ...CURATED_GENRES]
})

// Normalize genre name for display and filtering
const displayTitle = computed(() => {
  if (currentGenre.value.toLowerCase() === 'top-rated') {
    return t('genreView.topRatedTitle')
  }
  return t('genreView.title', { genre: translateGenre(currentGenre.value) })
})

const genreDescription = computed(() => {
  if (currentGenre.value.toLowerCase() === 'top-rated') {
    return t('genreView.topRatedDesc')
  }
  return t('genreView.desc', { genre: translateGenre(currentGenre.value) })
})

const genreShows = computed(() => {
  if (!shows.value.length && !extraShows.value.length) return []

  const g = currentGenre.value.toLowerCase()
  let list = []

  // 1. Base shows strictly from Page 0 (cached in shows.value)
  if (g === 'top-rated') {
    list = shows.value.filter(s => s.rating?.average >= 7.8)
  } else {
    list = shows.value.filter(s => 
      Array.isArray(s.genres) && s.genres.some(item => item.toLowerCase() === g)
    )
  }

  // 2. Combine with extra shows loaded specifically for THIS genre view
  if (extraShows.value.length > 0) {
    const existingIds = new Set(list.map(s => s.id))
    const uniqueExtras = extraShows.value.filter(s => !existingIds.has(s.id))
    list = [...list, ...uniqueExtras]
  }

  // 3. Sort
  return [...list].sort((a, b) => {
    if (sortBy.value === 'rating') {
      const rA = a.rating?.average ?? 0
      const rB = b.rating?.average ?? 0
      if (rB !== rA) return rB - rA
      return (b.weight ?? 0) - (a.weight ?? 0)
    }
    if (sortBy.value === 'popularity') {
      return (b.weight ?? 0) - (a.weight ?? 0)
    }
    if (sortBy.value === 'year') {
      const yA = a.premiered ? parseInt(a.premiered) : 0
      const yB = b.premiered ? parseInt(b.premiered) : 0
      return yB - yA
    }
    if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name)
    }
    return 0
  })
})

function changeGenre(newGenre) {
  currentGenre.value = newGenre
  resetGenreExtra()
  router.push({ name: 'genre-detail', params: { genre: newGenre } })
}

onMounted(() => {
  loadShows()
  if (props.genre) {
    currentGenre.value = props.genre
  }
})

watch(() => props.genre, (newVal) => {
  if (newVal) {
    currentGenre.value = newVal
    resetGenreExtra()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})
</script>

<template>
  <main class="genre-page container">
    <!-- Breadcrumb / Back button -->
    <div class="genre-top-nav">
      <router-link to="/" class="back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span>{{ t('genreView.back') }}</span>
      </router-link>
    </div>

    <!-- Genre Banner & Controls -->
    <div class="genre-hero-card">
      <div class="hero-left">
        <span class="genre-tag">{{ t('genreView.spotlight') }}</span>
        <h1 class="genre-main-title">{{ displayTitle }}</h1>
        <p class="genre-desc">
          {{ genreDescription }}
        </p>
      </div>

      <!-- Controls: Switch Genre & Sort By -->
      <div class="hero-controls">
        <!-- Genre Switcher Dropdown -->
        <div class="control-box">
          <label for="genre-select" class="control-label">{{ t('genreView.switchGenre') }}</label>
          <div class="select-wrapper">
            <select
              id="genre-select"
              :value="currentGenre"
              class="styled-select"
              @change="changeGenre($event.target.value)"
            >
              <option
                v-for="g in allGenres"
                :key="g"
                :value="g"
              >
                {{ g === 'Top-Rated' ? '⭐ ' + t('nav.topRated') : translateGenre(g) }}
              </option>
            </select>
            <svg class="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        <!-- Sort By Dropdown -->
        <div class="control-box">
          <label for="sort-select" class="control-label">{{ t('genreView.sortBy') }}</label>
          <div class="select-wrapper">
            <select
              id="sort-select"
              v-model="sortBy"
              class="styled-select"
            >
              <option value="rating">{{ t('genreView.sortRating') }}</option>
              <option value="popularity">{{ t('genreView.sortPopularity') }}</option>
              <option value="year">{{ t('genreView.sortYear') }}</option>
              <option value="name">{{ t('genreView.sortName') }}</option>
            </select>
            <svg class="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Count Indicator -->
    <div class="genre-status-bar">
      <span class="count-pill">
        {{ t('genreView.showingCount', { count: genreShows.length }) }}
      </span>
    </div>

    <!-- Loading State -->
    <template v-if="loading && !isLoaded">
      <LoadingSkeleton type="grid" :count="12" />
    </template>

    <!-- Error State -->
    <template v-else-if="error">
      <ErrorState
        :title="t('dashboard.emptyTitle')"
        :message="error"
        @retry="loadShows(true)"
      />
    </template>

    <!-- Results Grid -->
    <template v-else-if="genreShows.length > 0">
      <div class="grid-cards fade-in">
        <ShowCard
          v-for="(show, index) in genreShows"
          :key="show.id"
          :show="show"
          :show-rank="currentGenre.toLowerCase() === 'top-rated' ? index + 1 : null"
        />
      </div>

      <!-- Load More Section for Genre -->
      <div class="genre-load-more-section">
        <!-- Transient Feedback Toast -->
        <transition name="fade">
          <div v-if="loadMoreMessage" class="load-more-toast">
            {{ loadMoreMessage }}
          </div>
        </transition>

        <!-- Inline Error if fetch failed -->
        <div v-if="loadMoreError" class="load-more-error-box">
          <span class="error-msg">{{ loadMoreError }}</span>
          <button class="retry-inline-btn" @click="handleLoadMore">
            {{ t('dashboard.retry') }}
          </button>
        </div>

        <!-- Action Button / Complete State -->
        <div class="load-more-actions">
          <button
            v-if="hasMoreGenre"
            class="genre-load-more-btn"
            :disabled="isLoadingMore"
            @click="handleLoadMore"
          >
            <span v-if="isLoadingMore" class="btn-spinner" aria-hidden="true"></span>
            <span class="btn-label">
              {{ isLoadingMore ? t('genreView.loadingMore', { genre: translateGenre(currentGenre) }) : t('genreView.loadMore', { genre: translateGenre(currentGenre) }) }}
            </span>
            <svg v-if="!isLoadingMore" class="btn-arrow-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <div v-else class="catalog-complete-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="complete-icon">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{{ t('genreView.allLoaded', { genre: translateGenre(currentGenre) }) }}</span>
          </div>
        </div>

        <!-- Metadata text -->
        <p class="catalog-meta-info">
          {{ currentGenrePage > 0 ? t('genreView.pageSubtextLoaded', { count: genreShows.length, genre: translateGenre(currentGenre), extra: extraShows.length, page: currentGenrePage }) : t('genreView.pageSubtextInitial', { count: genreShows.length, genre: translateGenre(currentGenre) }) }}
        </p>
      </div>
    </template>

    <!-- Empty State -->
    <div v-else class="empty-genre-box">
      <p>{{ t('genreView.empty', { genre: translateGenre(currentGenre) }) }}</p>
      <div class="empty-actions">
        <button
          v-if="hasMoreGenre"
          class="genre-load-more-btn"
          :disabled="isLoadingMore"
          @click="handleLoadMore"
        >
          <span v-if="isLoadingMore" class="btn-spinner" aria-hidden="true"></span>
          <span>{{ t('genreView.fetchNextPages', { genre: translateGenre(currentGenre) }) }}</span>
        </button>
        <button class="reset-btn" @click="changeGenre('Drama')">
          {{ t('genreView.viewDrama') }}
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.genre-page {
  padding-top: 1.5rem;
  padding-bottom: 4rem;
}

.genre-top-nav {
  margin-bottom: 1.25rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-secondary);
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-full);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  transition: all var(--transition-fast);
}

.back-link:hover {
  color: var(--accent);
  border-color: var(--border-accent);
  transform: translateX(-3px);
}

.back-link svg {
  width: 15px;
  height: 15px;
}

.genre-hero-card {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  background: linear-gradient(135deg, rgba(41, 32, 32, 0.95) 0%, rgba(26, 21, 21, 0.95) 100%);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.genre-hero-card::after {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(230, 57, 70, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

@media (min-width: 860px) {
  .genre-hero-card {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.hero-left {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 540px;
}

.genre-tag {
  align-self: flex-start;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.2rem 0.65rem;
  background: var(--accent-gradient-subtle);
  border: 1px solid var(--border-accent);
  color: var(--accent);
  border-radius: var(--radius-full);
}

.genre-main-title {
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.genre-desc {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.hero-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  z-index: 2;
}

.control-box {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.control-label {
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.styled-select {
  appearance: none;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-light);
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.6rem 2.4rem 0.6rem 0.95rem;
  border-radius: var(--radius-md);
  outline: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  min-width: 170px;
}

.styled-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.25);
}

.select-arrow {
  position: absolute;
  right: 0.75rem;
  width: 15px;
  height: 15px;
  color: var(--text-muted);
  pointer-events: none;
}

.genre-status-bar {
  margin-bottom: 1.5rem;
}

.count-pill {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.count-pill strong {
  color: #fff;
}

.empty-genre-box {
  text-align: center;
  padding: 4rem 1.5rem;
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
}

.reset-btn {
  margin-top: 1rem;
  padding: 0.6rem 1.25rem;
  background: var(--accent-gradient);
  color: #fff;
  font-weight: 700;
  border-radius: var(--radius-md);
}

/* Load More Section Styles */
.genre-load-more-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 3.5rem;
  padding: 1.5rem 0;
  gap: 1.15rem;
}

.load-more-toast {
  background: rgba(22, 33, 27, 0.95);
  color: #4ade80;
  border: 1px solid rgba(74, 222, 128, 0.4);
  padding: 0.55rem 1.4rem;
  border-radius: var(--radius-full);
  font-size: 0.88rem;
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.load-more-error-box {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #f87171;
  padding: 0.6rem 1.25rem;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
}

.retry-inline-btn {
  background: #ef4444;
  color: #fff;
  border: none;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.retry-inline-btn:hover {
  opacity: 0.85;
}

.load-more-actions {
  display: flex;
  justify-content: center;
}

.genre-load-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  background: var(--accent-gradient);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  padding: 0.85rem 2.25rem;
  border-radius: var(--radius-full);
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 18px rgba(230, 57, 70, 0.35);
  transition: all var(--transition-normal);
}

.genre-load-more-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(230, 57, 70, 0.5);
}

.genre-load-more-btn:active:not(:disabled) {
  transform: translateY(0);
}

.genre-load-more-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-arrow-down {
  width: 17px;
  height: 17px;
  transition: transform var(--transition-fast);
}

.genre-load-more-btn:hover:not(:disabled) .btn-arrow-down {
  transform: translateY(2px);
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.catalog-complete-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.4rem;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: 0.88rem;
  font-weight: 600;
}

.complete-icon {
  width: 16px;
  height: 16px;
  color: #4ade80;
}

.catalog-meta-info {
  font-size: 0.82rem;
  color: var(--text-muted);
  text-align: center;
}

.catalog-meta-info strong {
  color: var(--text-secondary);
}

.empty-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.25rem;
  flex-wrap: wrap;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
