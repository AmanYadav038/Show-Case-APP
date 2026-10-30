<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useShows, CURATED_GENRES } from '../composables/useShows.js'
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
const { shows, loading, error, isLoaded, loadShows } = useShows()

const currentGenre = ref(props.genre || 'Drama')
const sortBy = ref('rating') // 'rating' | 'popularity' | 'year' | 'name'

// All available genre choices including 'Top-Rated'
const allGenres = computed(() => {
  return ['Top-Rated', ...CURATED_GENRES]
})

// Normalize genre name for display and filtering
const displayTitle = computed(() => {
  if (currentGenre.value.toLowerCase() === 'top-rated') {
    return 'Top Rated TV Shows'
  }
  return `${currentGenre.value} TV Shows`
})

const genreShows = computed(() => {
  if (!shows.value.length) return []

  const g = currentGenre.value.toLowerCase()
  let list = []

  if (g === 'top-rated') {
    list = shows.value.filter(s => s.rating?.average >= 7.8)
  } else {
    list = shows.value.filter(s => 
      Array.isArray(s.genres) && s.genres.some(item => item.toLowerCase() === g)
    )
  }

  // Sort
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
        <span>Back to Dashboard</span>
      </router-link>
    </div>

    <!-- Genre Banner & Controls -->
    <div class="genre-hero-card">
      <div class="hero-left">
        <span class="genre-tag">Genre Spotlight</span>
        <h1 class="genre-main-title">{{ displayTitle }}</h1>
        <p class="genre-desc">
          Browse the highest-rated and most popular {{ currentGenre }} series curated from TVMaze.
        </p>
      </div>

      <!-- Controls: Switch Genre & Sort By -->
      <div class="hero-controls">
        <!-- Genre Switcher Dropdown -->
        <div class="control-box">
          <label for="genre-select" class="control-label">Switch Genre:</label>
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
                {{ g === 'Top-Rated' ? '⭐ Top-Rated' : g }}
              </option>
            </select>
            <svg class="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        <!-- Sort By Dropdown -->
        <div class="control-box">
          <label for="sort-select" class="control-label">Sort By:</label>
          <div class="select-wrapper">
            <select
              id="sort-select"
              v-model="sortBy"
              class="styled-select"
            >
              <option value="rating">Rating (Highest first)</option>
              <option value="popularity">Popularity / Weight</option>
              <option value="year">Release Year (Newest)</option>
              <option value="name">Title (A–Z)</option>
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
        Showing <strong>{{ genreShows.length }}</strong> TV shows
      </span>
    </div>

    <!-- Loading State -->
    <template v-if="loading && !isLoaded">
      <LoadingSkeleton type="grid" :count="12" />
    </template>

    <!-- Error State -->
    <template v-else-if="error">
      <ErrorState
        title="Failed to Load Shows"
        :message="error"
        @retry="loadShows(true)"
      />
    </template>

    <!-- Results Grid -->
    <div v-else-if="genreShows.length > 0" class="grid-cards fade-in">
      <ShowCard
        v-for="(show, index) in genreShows"
        :key="show.id"
        :show="show"
        :show-rank="currentGenre.toLowerCase() === 'top-rated' ? index + 1 : null"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="empty-genre-box">
      <p>No shows currently listed under "{{ currentGenre }}".</p>
      <button class="reset-btn" @click="changeGenre('Drama')">
        View Drama Shows
      </button>
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
</style>
