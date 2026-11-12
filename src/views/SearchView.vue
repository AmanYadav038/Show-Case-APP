<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchShows, searchPeople, fetchPersonCastCredits } from '../services/tvmazeApi.js'
import { CURATED_GENRES } from '../composables/useShows.js'
import { useI18n } from '../composables/useI18n.js'
import { useDataSaver } from '../composables/useDataSaver.js'
import ShowCard from '../components/shows/ShowCard.vue'
import LoadingSkeleton from '../components/common/LoadingSkeleton.vue'
import ErrorState from '../components/common/ErrorState.vue'

const route = useRoute()
const router = useRouter()
const { t, translateGenre } = useI18n()
const { getOptimizedImageUrl } = useDataSaver()

const queryText = ref(route.query.q || '')
const searchType = ref(route.query.type || 'all') // 'all' | 'shows' | 'actors' | 'genres'
const rawResults = ref([])
const actorResult = ref(null)
const matchedPeopleList = ref([])
const matchedGenreResult = ref(null)
const loading = ref(false)
const error = ref(null)

const selectedGenre = ref('All')
const sortBy = ref('rating') // 'rating' | 'name' | 'year'

const actorAvatarUrl = computed(() => {
  return actorResult.value ? getOptimizedImageUrl(actorResult.value.image, 'medium', actorResult.value.name) : null
})

const dynamicPlaceholder = computed(() => {
  if (searchType.value === 'shows') return t('search.placeholderShows')
  if (searchType.value === 'actors') return t('search.placeholderActors')
  if (searchType.value === 'genres') return t('search.placeholderGenres')
  return t('search.placeholder')
})

const isActorSpotlightVisible = computed(() => {
  if (!actorResult.value || loading.value) return false
  return searchType.value === 'actors' || searchType.value === 'all'
})

// Fetch search results whenever route query changes or component mounts
async function performSearch(q, type = searchType.value, personId = route.query.personId) {
  if (!q || !q.trim()) {
    rawResults.value = []
    actorResult.value = null
    matchedPeopleList.value = []
    matchedGenreResult.value = null
    loading.value = false
    return
  }

  loading.value = true
  error.value = null
  actorResult.value = null
  matchedPeopleList.value = []
  matchedGenreResult.value = null

  const trimmed = q.trim()

  try {
    if (type === 'actors') {
      // 1. Explicitly searching for ACTORS
      const people = await searchPeople(trimmed)
      matchedPeopleList.value = people

      if (people.length > 0) {
        const chosenActor = (personId && people.find(p => String(p.id) === String(personId))) || people[0]
        actorResult.value = chosenActor

        try {
          const starredShows = await fetchPersonCastCredits(chosenActor.id)
          rawResults.value = starredShows
        } catch (creditErr) {
          rawResults.value = []
        }
      } else {
        rawResults.value = []
      }
    } else if (type === 'shows') {
      // 2. Explicitly searching for TV SHOWS (actor spotlight hidden)
      const shows = await searchShows(trimmed)
      rawResults.value = shows
      actorResult.value = null
    } else if (type === 'genres') {
      // 3. Explicitly searching for GENRES (actor spotlight hidden)
      actorResult.value = null
      const lower = trimmed.toLowerCase()
      const matchedGenre = CURATED_GENRES.find(g => g.toLowerCase().includes(lower))
      if (matchedGenre) {
        matchedGenreResult.value = matchedGenre
      }

      const shows = await searchShows(trimmed)
      const genreShows = shows.filter(s => Array.isArray(s.genres) && s.genres.some(g => g.toLowerCase().includes(lower)))
      rawResults.value = genreShows.length > 0 ? genreShows : shows
    } else {
      // 4. 'all' - Unified search
      const lower = trimmed.toLowerCase()
      const matchedGenre = CURATED_GENRES.find(g => g.toLowerCase().includes(lower))
      if (matchedGenre) {
        matchedGenreResult.value = matchedGenre
      }

      if (personId) {
        const [creditsRes, peopleRes, showsRes] = await Promise.allSettled([
          fetchPersonCastCredits(personId),
          searchPeople(trimmed),
          searchShows(trimmed)
        ])

        const actorShows = creditsRes.status === 'fulfilled' ? creditsRes.value : []
        const people = peopleRes.status === 'fulfilled' ? peopleRes.value : []
        const shows = showsRes.status === 'fulfilled' ? showsRes.value : []

        actorResult.value = people.find(p => String(p.id) === String(personId)) || people[0] || null

        const mergedMap = new Map()
        for (const s of actorShows) {
          if (s && s.id) mergedMap.set(s.id, s)
        }
        for (const s of shows) {
          if (s && s.id && !mergedMap.has(s.id)) {
            mergedMap.set(s.id, s)
          }
        }
        rawResults.value = Array.from(mergedMap.values())
      } else {
        const [showsRes, peopleRes] = await Promise.allSettled([
          searchShows(trimmed),
          searchPeople(trimmed)
        ])

        const shows = showsRes.status === 'fulfilled' ? showsRes.value : []
        const people = peopleRes.status === 'fulfilled' ? peopleRes.value : []

        const trimmedLower = trimmed.toLowerCase()
        const exactPerson = people.find(p => p.name?.toLowerCase() === trimmedLower)
        const topPerson = exactPerson || (people.length > 0 ? people[0] : null)

        if (topPerson && (shows.length === 0 || exactPerson)) {
          actorResult.value = topPerson
          try {
            const actorShows = await fetchPersonCastCredits(topPerson.id)
            const mergedMap = new Map()
            for (const s of actorShows) {
              if (s && s.id) mergedMap.set(s.id, s)
            }
            for (const s of shows) {
              if (s && s.id && !mergedMap.has(s.id)) {
                mergedMap.set(s.id, s)
              }
            }
            rawResults.value = Array.from(mergedMap.values())
          } catch (creditErr) {
            rawResults.value = shows
          }
        } else {
          rawResults.value = shows
        }
      }
    }
  } catch (err) {
    error.value = err.message || 'Error occurred while searching.'
    rawResults.value = []
  } finally {
    loading.value = false
  }
}

function handleSearchSubmit() {
  const trimmed = queryText.value.trim()
  const qObj = {}
  if (trimmed) qObj.q = trimmed
  if (searchType.value !== 'all') qObj.type = searchType.value
  router.push({ name: 'search', query: qObj })
}

function onSearchTypeChange() {
  const trimmed = queryText.value.trim()
  const qObj = {}
  if (trimmed) qObj.q = trimmed
  if (searchType.value !== 'all') qObj.type = searchType.value
  router.push({ name: 'search', query: qObj })
}

function selectActor(person) {
  actorResult.value = person
  router.push({
    name: 'search',
    query: {
      q: queryText.value.trim(),
      type: 'actors',
      personId: person.id
    }
  })
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
  if (route.query.type) {
    searchType.value = route.query.type
  }
  if (route.query.q) {
    queryText.value = route.query.q
    performSearch(route.query.q, searchType.value, route.query.personId)
  }
})

watch(() => [route.query.q, route.query.type, route.query.personId], ([newQ, newType, newPersonId]) => {
  queryText.value = newQ || ''
  searchType.value = newType || 'all'
  performSearch(newQ, newType || 'all', newPersonId)
})
</script>

<template>
  <main class="search-page container">
    <!-- Search Header -->
    <div class="search-hero">
      <h1 class="search-heading">{{ t('search.title') }}</h1>
      <form class="search-input-form" @submit.prevent="handleSearchSubmit">
        <!-- Search Category Selector Dropdown -->
        <div class="search-type-wrapper">
          <select
            v-model="searchType"
            class="search-type-select"
            aria-label="Filter search category"
            @change="onSearchTypeChange"
          >
            <option value="all">{{ t('search.searchTypeAll') }}</option>
            <option value="shows">{{ t('search.searchTypeShows') }}</option>
            <option value="actors">{{ t('search.searchTypeActors') }}</option>
            <option value="genres">{{ t('search.searchTypeGenres') }}</option>
          </select>
          <svg class="type-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        <div class="input-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            v-model="queryText"
            type="search"
            class="main-search-input"
            :placeholder="dynamicPlaceholder"
            autofocus
          />
        </div>
        <button type="submit" class="search-submit-btn">
          Search
        </button>
      </form>
    </div>

    <!-- Genre Spotlight Card (When searching by Genre or Genre match found) -->
    <div v-if="matchedGenreResult && !loading && (searchType === 'genres' || searchType === 'all')" class="genre-spotlight-card fade-in">
      <div class="genre-spotlight-inner">
        <div class="genre-spotlight-icon">🎭</div>
        <div class="genre-spotlight-info">
          <span class="genre-spotlight-badge">{{ t('search.genreSpotlight') }}</span>
          <h2 class="genre-spotlight-title">{{ translateGenre(matchedGenreResult) }} TV Shows</h2>
          <p class="genre-spotlight-desc">{{ t('genreView.desc', { genre: translateGenre(matchedGenreResult) }) }}</p>
        </div>
        <router-link
          :to="{ name: 'genre-detail', params: { genre: matchedGenreResult } }"
          class="genre-spotlight-btn"
        >
          <span>{{ t('search.exploreGenreBtn', { genre: translateGenre(matchedGenreResult) }) }}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </router-link>
      </div>
    </div>

    <!-- Multiple Matching Actors Selector (When multiple actors found in 'actors' mode) -->
    <div v-if="searchType === 'actors' && matchedPeopleList.length > 1 && !loading" class="actor-chips-row fade-in">
      <span class="actor-chips-label">{{ t('search.selectActorPrompt') }}</span>
      <div class="actor-chips-scroll">
        <button
          v-for="p in matchedPeopleList.slice(0, 8)"
          :key="p.id"
          type="button"
          class="actor-chip-btn"
          :class="{ active: actorResult?.id === p.id }"
          @click="selectActor(p)"
        >
          <span>👤 {{ p.name }}</span>
        </button>
      </div>
    </div>

    <!-- Actor Spotlight Banner (Visible accordingly: only in 'actors' or 'all' mode when actorResult exists) -->
    <div v-if="isActorSpotlightVisible" class="actor-spotlight-card fade-in">
      <div class="actor-card-inner">
        <div class="actor-avatar-wrap">
          <img
            v-if="actorAvatarUrl"
            :src="actorAvatarUrl"
            :alt="actorResult.name"
            class="actor-avatar-img"
          />
          <div v-else class="actor-avatar-fallback">👤</div>
        </div>
        <div class="actor-info">
          <div class="actor-badge-row">
            <span class="actor-badge">{{ t('search.actorSpotlight') }}</span>
            <span v-if="actorResult.gender" class="actor-gender-tag">{{ actorResult.gender }}</span>
          </div>
          <h2 class="actor-name">{{ actorResult.name }}</h2>
          <p class="actor-meta-line">
            <span v-if="actorResult.country?.name">📍 {{ actorResult.country.name }}</span>
            <span v-if="actorResult.country?.name && actorResult.birthday" class="meta-dot">•</span>
            <span v-if="actorResult.birthday">🎂 Born {{ actorResult.birthday }}</span>
            <span v-if="rawResults.length" class="meta-dot">•</span>
            <span v-if="rawResults.length" class="actor-shows-count">
              🎬 {{ t('search.actorShowsCount', { name: actorResult.name, count: rawResults.length }) }}
            </span>
          </p>
        </div>
      </div>
    </div>

    <!-- Active query meta & Filter / Sort Toolbar -->
    <div v-if="rawResults.length > 0" class="results-toolbar">
      <div class="toolbar-left">
        <span class="results-summary">
          <template v-if="searchType === 'actors' && actorResult">
            {{ t('search.starringActor', { name: actorResult.name }) }} ({{ filteredResults.length }})
          </template>
          <template v-else-if="searchType === 'genres' && matchedGenreResult">
            {{ t('genreView.showingCount', { count: filteredResults.length }) }}
            <span> in <strong>{{ translateGenre(matchedGenreResult) }}</strong></span>
          </template>
          <template v-else-if="isActorSpotlightVisible && actorResult">
            {{ t('search.starringActor', { name: actorResult.name }) }} ({{ filteredResults.length }})
          </template>
          <template v-else>
            {{ t('search.resultsFound', { count: filteredResults.length }) }}
            <span v-if="route.query.q"> for "<strong>{{ route.query.q }}</strong>"</span>
          </template>
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
            {{ genre === 'All' ? t('search.all') : translateGenre(genre) }}
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
      <h3 class="no-results-title">
        {{ (isActorSpotlightVisible && actorResult) ? `No Shows for ${actorResult.name}` : (searchType === 'actors' ? 'No Actors Found' : 'No TV Shows Found') }}
      </h3>
      <p class="no-results-desc">
        <template v-if="searchType === 'actors'">
          {{ actorResult ? `We couldn't find any TV shows starring "${actorResult.name}"` : `No actors or cast found matching "${route.query.q}"` }}
        </template>
        <template v-else-if="actorResult && isActorSpotlightVisible">
          We couldn't find any TV shows starring "{{ actorResult.name }}"
        </template>
        <template v-else-if="searchType === 'genres'">
          We couldn't find any shows in genre "{{ route.query.q }}"
        </template>
        <template v-else>
          We couldn't find any shows matching "{{ route.query.q }}"
        </template>
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

/* Actor Spotlight Card */
.actor-spotlight-card {
  background: linear-gradient(135deg, rgba(230, 57, 70, 0.12) 0%, rgba(20, 20, 30, 0.7) 100%);
  border: 1px solid rgba(230, 57, 70, 0.35);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
}

.actor-card-inner {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.actor-avatar-wrap {
  width: 90px;
  height: 90px;
  border-radius: var(--radius-full);
  overflow: hidden;
  border: 3px solid rgba(230, 57, 70, 0.55);
  box-shadow: 0 4px 18px rgba(230, 57, 70, 0.35);
  flex-shrink: 0;
  background: var(--bg-surface);
}

.actor-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.actor-avatar-img[src*="play"],
.actor-avatar-img[src*="placeholder"] {
  object-fit: contain;
  padding: 1rem;
  background: #241c1d;
}

.actor-avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.25rem;
  background: rgba(255, 255, 255, 0.05);
}

.actor-info {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.actor-badge-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.actor-badge {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.2rem 0.55rem;
  background: var(--primary);
  color: #fff;
  border-radius: var(--radius-full);
}

.actor-gender-tag {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.06);
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-full);
}

.actor-name {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  margin: 0;
}

.actor-meta-line {
  font-size: 0.88rem;
  color: var(--text-secondary);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
}

.actor-shows-count {
  color: var(--primary);
  font-weight: 600;
}

@media (max-width: 640px) {
  .actor-card-inner {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .actor-badge-row,
  .actor-meta-line {
    justify-content: center;
  }
}

/* Search Scope / Type Dropdown */
.search-type-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-type-select {
  appearance: none;
  -webkit-appearance: none;
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 0.85rem 2.25rem 0.85rem 1.1rem;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  outline: none;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.search-type-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.25);
}

.type-arrow-icon {
  position: absolute;
  right: 0.8rem;
  width: 14px;
  height: 14px;
  color: var(--text-muted);
  pointer-events: none;
}

/* Actor Multiple Match Selector Chips */
.actor-chips-row {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
  padding: 0.85rem 1.25rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
}

.actor-chips-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.actor-chips-scroll {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
}

.actor-chip-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.85rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  color: var(--text-primary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.actor-chip-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--border-light);
}

.actor-chip-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
  box-shadow: 0 0 12px rgba(230, 57, 70, 0.4);
}

/* Genre Spotlight Banner */
.genre-spotlight-card {
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.15) 0%, rgba(20, 20, 30, 0.7) 100%);
  border: 1px solid rgba(74, 144, 226, 0.35);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
}

.genre-spotlight-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.genre-spotlight-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.genre-spotlight-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.genre-spotlight-badge {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.2rem 0.55rem;
  background: rgba(74, 144, 226, 0.25);
  color: #64b5f6;
  border-radius: var(--radius-full);
  align-self: flex-start;
}

.genre-spotlight-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.genre-spotlight-desc {
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin: 0;
}

.genre-spotlight-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-md);
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.genre-spotlight-btn:hover {
  background: var(--primary);
  border-color: var(--primary);
  transform: translateX(2px);
}

.genre-spotlight-btn svg {
  width: 16px;
  height: 16px;
}

@media (max-width: 640px) {
  .search-input-form {
    flex-direction: column;
  }
  .search-type-select {
    width: 100%;
  }
  .genre-spotlight-inner {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  .genre-spotlight-badge {
    align-self: center;
  }
}
</style>
