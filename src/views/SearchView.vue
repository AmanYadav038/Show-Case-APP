<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchShows } from '../services/tvmazeApi.js'
import ShowCard from '../components/shows/ShowCard.vue'
import LoadingSkeleton from '../components/common/LoadingSkeleton.vue'
import ErrorState from '../components/common/ErrorState.vue'

const route = useRoute()
const router = useRouter()

const queryText = ref(route.query.q || '')
const rawResults = ref([])
const loading = ref(false)
const error = ref(null)

const selectedGenre = ref('All')
const sortBy = ref('rating') // 'rating' | 'name' | 'year'

// Fetch search results whenever route query changes or component mounts
async function performSearch(q) {
  if (!q || !q.trim()) {
    rawResults.value = []
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  try {
    const data = await searchShows(q)
    rawResults.value = data
  } catch (err) {
    error.value = err.message || 'Error occurred while searching.'
    rawResults.value = []
  } finally {
    loading.value = false
  }
}

function handleSearchSubmit() {
  const trimmed = queryText.value.trim()
  router.push({ name: 'search', query: trimmed ? { q: trimmed } : {} })
}

// Available genres extracted dynamically from results
const availableGenres = computed(() => {
  const set = new Set()
  for (const show of rawResults.value) {
    if (Array.isArray(show.genres)) {
      show.genres.forEach(g => set.add(g))
    }
  }
  return ['All', ...Array.from(set).sort()]
})

// Filtered & Sorted results
const filteredResults = computed(() => {
  let list = [...rawResults.value]

  // Filter by genre
  if (selectedGenre.value !== 'All') {
    list = list.filter(s => Array.isArray(s.genres) && s.genres.includes(selectedGenre.value))
  }

  // Sort
  list.sort((a, b) => {
    if (sortBy.value === 'rating') {
      const rA = a.rating?.average ?? 0
      const rB = b.rating?.average ?? 0
      return rB - rA
    }
    if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name)
    }
    if (sortBy.value === 'year') {
      const yA = a.premiered ? parseInt(a.premiered) : 0
      const yB = b.premiered ? parseInt(b.premiered) : 0
      return yB - yA
    }
    return 0
  })

  return list
})

onMounted(() => {
  if (route.query.q) {
    queryText.value = route.query.q
    performSearch(route.query.q)
  }
})

watch(() => route.query.q, (newQ) => {
  queryText.value = newQ || ''
  performSearch(newQ)
})
</script>

<template>
  <main class="search-page container">
    <!-- Search Header -->
    <div class="search-hero">
      <h1 class="search-heading">Find TV Shows & Series</h1>
      <form class="search-input-form" @submit.prevent="handleSearchSubmit">
        <div class="input-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            v-model="queryText"
            type="search"
            class="main-search-input"
            placeholder="Search by show title, keyword, or actor..."
            autofocus
          />
        </div>
        <button type="submit" class="search-submit-btn">
          Search
        </button>
      </form>
    </div>

    <!-- Active query meta & Filter / Sort Toolbar -->
    <div v-if="rawResults.length > 0" class="results-toolbar">
      <div class="toolbar-left">
        <span class="results-summary">
          Found <strong>{{ filteredResults.length }}</strong> TV shows
          <span v-if="route.query.q"> for "<strong>{{ route.query.q }}</strong>"</span>
        </span>

        <!-- Genre Filter Pills -->
        <div v-if="availableGenres.length > 2" class="genre-filter-scroll">
          <button
            v-for="genre in availableGenres"
            :key="genre"
            class="filter-chip"
            :class="{ active: selectedGenre === genre }"
            @click="selectedGenre = genre"
          >
            {{ genre }}
          </button>
        </div>
      </div>

      <!-- Sort Options -->
      <div class="toolbar-right">
        <label for="sort-select" class="sort-label">Sort by:</label>
        <select id="sort-select" v-model="sortBy" class="sort-select">
          <option value="rating">Rating (High to Low)</option>
          <option value="year">Release Year (Newest)</option>
          <option value="name">Title (A–Z)</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <template v-if="loading">
      <LoadingSkeleton type="grid" :count="12" />
    </template>

    <!-- Error State -->
    <template v-else-if="error">
      <ErrorState
        title="Search Error"
        :message="error"
        @retry="performSearch(route.query.q)"
      />
    </template>

    <!-- Empty Search State -->
    <div v-else-if="route.query.q && !filteredResults.length && !loading" class="no-results-box">
      <div class="empty-icon-wrap">
        <span>🔍</span>
      </div>
      <h3 class="no-results-title">No TV Shows Found</h3>
      <p class="no-results-desc">
        We couldn't find any shows matching "{{ route.query.q }}"
        <span v-if="selectedGenre !== 'All'"> in genre "{{ selectedGenre }}"</span>.
      </p>
      <div class="suggestions-box">
        <strong>Suggestions:</strong>
        <ul>
          <li>Check for spelling errors</li>
          <li>Try broader keywords (e.g. "Game", "Breaking", "Star")</li>
          <li>Clear the active genre filter</li>
        </ul>
      </div>
      <button v-if="selectedGenre !== 'All'" class="reset-filter-btn" @click="selectedGenre = 'All'">
        Clear Genre Filter
      </button>
    </div>

    <!-- Initial Prompt when no search entered yet -->
    <div v-else-if="!route.query.q && !rawResults.length" class="empty-prompt">
      <span class="prompt-icon">🎬</span>
      <h2>Search the TVMaze Universe</h2>
      <p>Search over thousands of popular shows, television classics, and streaming series.</p>
    </div>

    <!-- Results Grid -->
    <div v-else class="grid-cards fade-in">
      <ShowCard
        v-for="show in filteredResults"
        :key="show.id"
        :show="show"
      />
    </div>
  </main>
</template>

<style scoped>
.search-page {
  padding-top: 2rem;
  padding-bottom: 4rem;
}

.search-hero {
  max-width: 680px;
  margin: 0 auto 2.5rem;
  text-align: center;
}

.search-heading {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 1.25rem;
  letter-spacing: -0.02em;
}

.search-input-form {
  display: flex;
  gap: 0.65rem;
}

.input-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  width: 20px;
  height: 20px;
  color: var(--text-muted);
}

.main-search-input {
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 2.85rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: all var(--transition-fast);
}

.main-search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.25);
}

.search-submit-btn {
  padding: 0.85rem 1.6rem;
  background: var(--accent-gradient);
  color: #fff;
  font-weight: 800;
  font-size: 0.95rem;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.search-submit-btn:hover {
  background: var(--accent-gradient-hover);
  transform: translateY(-1px);
}

.results-toolbar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border-subtle);
}

@media (min-width: 768px) {
  .results-toolbar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.toolbar-left {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.results-summary {
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.genre-filter-scroll {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
}

.filter-chip {
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.25rem 0.65rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.filter-chip:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.filter-chip.active {
  background: var(--accent-gradient);
  color: #fff;
  border-color: transparent;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  align-self: flex-start;
}

@media (min-width: 768px) {
  .toolbar-right {
    align-self: center;
  }
}

.sort-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 600;
  white-space: nowrap;
}

.sort-select {
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-light);
  color: var(--text-primary);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-sm);
  outline: none;
  cursor: pointer;
}

.sort-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.25);
}

.no-results-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4rem 1.5rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  max-width: 520px;
  margin: 2rem auto;
}

.empty-icon-wrap {
  font-size: 2.75rem;
  margin-bottom: 1rem;
}

.no-results-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.no-results-desc {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.suggestions-box {
  text-align: left;
  font-size: 0.85rem;
  color: var(--text-muted);
  background: rgba(0, 0, 0, 0.25);
  padding: 1rem 1.5rem;
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
  width: 100%;
}

.suggestions-box ul {
  margin-top: 0.4rem;
  padding-left: 1.25rem;
}

.reset-filter-btn {
  padding: 0.6rem 1.25rem;
  background: var(--accent-gradient);
  color: #fff;
  font-weight: 700;
  font-size: 0.88rem;
  border-radius: var(--radius-md);
}

.empty-prompt {
  text-align: center;
  padding: 5rem 1.5rem;
  color: var(--text-secondary);
}

.prompt-icon {
  font-size: 3.5rem;
  display: block;
  margin-bottom: 1rem;
}

.empty-prompt h2 {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-prompt p {
  font-size: 0.95rem;
  color: var(--text-muted);
}
</style>
