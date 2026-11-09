<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSearch } from '../../composables/useSearch.js'
import { useI18n } from '../../composables/useI18n.js'
import { formatYearRange, getImageUrl } from '../../utils/formatters.js'
import RatingBadge from '../common/RatingBadge.vue'

// Import icons as static SVG assets from assets folder
import searchIcon from '@/assets/icons/search.svg'
import closeIcon from '@/assets/icons/close.svg'
import arrowRightIcon from '@/assets/icons/arrow-right.svg'
import tvIcon from '@/assets/icons/tv.svg'
import actorIcon from '@/assets/icons/actor.svg'
import genreIcon from '@/assets/icons/genre.svg'

const router = useRouter()
const { query, results, isSearching, searchScope, setScope, handleInput, clearSearch } = useSearch()
const { t } = useI18n()

const isDropdownOpen = ref(false)
const searchContainer = ref(null)

const scopes = computed(() => [
  { id: 'all', label: t('search.all'), icon: searchIcon },
  { id: 'shows', label: t('search.shows'), icon: tvIcon },
  { id: 'actors', label: t('search.people'), icon: actorIcon },
  { id: 'genres', label: t('search.genres'), icon: genreIcon }
])

const displayedResults = computed(() => results.value.slice(0, 8))

function onInput(event) {
  const val = event.target.value
  handleInput(val)
  isDropdownOpen.value = val.trim().length > 0
}

function onFocus() {
  if (query.value.trim().length > 0) {
    isDropdownOpen.value = true
  }
}

function selectResult(item) {
  isDropdownOpen.value = false
  clearSearch()

  if (item.resultType === 'person') {
    // Navigate to search results with actor's name and actor ID
    router.push({ name: 'search', query: { q: item.name, personId: item.id } })
  } else if (item.resultType === 'genre') {
    // Navigate directly to genre collection view
    router.push({ name: 'genre-detail', params: { genre: item.genreName } })
  } else {
    // Navigate to show details
    router.push({ name: 'show-detail', params: { id: item.id } })
  }
}

// Retain alias for test compatibility
function selectShow(show) {
  selectResult(show)
}

function submitSearch() {
  const q = query.value.trim()
  if (!q) return

  isDropdownOpen.value = false
  router.push({ name: 'search', query: { q } })
}

function handleClickOutside(e) {
  if (searchContainer.value && !searchContainer.value.contains(e.target)) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="searchContainer" class="search-bar-wrapper">
    <div class="search-input-box" :class="{ 'focused': isDropdownOpen }">
      <!-- Search button using <img> tag -->
      <button
        type="button"
        class="search-icon-btn"
        aria-label="Search"
        title="Search"
        @click="submitSearch"
      >
        <img :src="searchIcon" class="search-icon" alt="Search icon" />
      </button>

      <input
        type="search"
        :value="query"
        :placeholder="t('nav.searchPlaceholder')"
        class="search-input"
        autocomplete="off"
        aria-label="Search shows"
        @input="onInput"
        @focus="onFocus"
      />

      <!-- Spinner indicator -->
      <div v-if="isSearching" class="search-spinner" aria-label="Searching..."></div>

      <!-- Clear button using <img> tag -->
      <button
        v-else-if="query"
        type="button"
        class="clear-btn"
        aria-label="Clear search"
        @click="clearSearch"
      >
        <img :src="closeIcon" class="clear-icon" alt="Clear icon" />
      </button>
    </div>

    <!-- Live Suggestions & Granular Search Dropdown -->
    <div v-if="isDropdownOpen && query.trim()" class="search-dropdown fade-in">
      <!-- Granular Category Filter Tabs -->
      <div class="search-scope-tabs" role="tablist" aria-label="Search Categories">
        <button
          v-for="s in scopes"
          :key="s.id"
          type="button"
          class="scope-tab-btn"
          :class="{ active: searchScope === s.id }"
          @click.stop="setScope(s.id)"
        >
          <img :src="s.icon" class="scope-tab-icon" :alt="s.label" />
          <span>{{ s.label }}</span>
        </button>
      </div>

      <!-- Loading indicator text -->
      <div v-if="isSearching && !displayedResults.length" class="dropdown-status">
        Searching TVMaze database for {{ searchScope }}...
      </div>

      <!-- No results notice -->
      <div v-else-if="!isSearching && !displayedResults.length" class="dropdown-status">
        No results found for "<span class="query-highlight">{{ query }}</span>" in {{ searchScope }}.
      </div>

      <!-- Results list -->
      <ul v-else class="results-list" role="listbox">
        <li
          v-for="item in displayedResults"
          :key="item.id"
          class="result-item"
          role="option"
          @click="selectResult(item)"
        >
          <!-- Genre Item -->
          <template v-if="item.resultType === 'genre'">
            <div class="result-thumb-wrapper genre-thumb">
              <img :src="genreIcon" class="genre-icon-img" alt="Genre" />
            </div>
            <div class="result-info">
              <div class="result-title">{{ item.name }}</div>
              <div class="result-meta">
                <span class="category-chip genre-chip">Genre Collection</span>
              </div>
            </div>
          </template>

          <!-- Actor / Person Item -->
          <template v-else-if="item.resultType === 'person'">
            <div class="result-thumb-wrapper person-thumb">
              <img
                v-if="getImageUrl(item.image, 'medium')"
                :src="getImageUrl(item.image, 'medium')"
                :alt="item.name"
                class="result-thumb"
              />
              <div v-else class="result-thumb-fallback">👤</div>
            </div>
            <div class="result-info">
              <div class="result-title">{{ item.name }}</div>
              <div class="result-meta">
                <span class="category-chip actor-chip">Actor / Cast</span>
                <span v-if="item.country?.name" class="meta-dot">•</span>
                <span v-if="item.country?.name" class="meta-country">{{ item.country.name }}</span>
              </div>
            </div>
          </template>

          <!-- Standard TV Show Item -->
          <template v-else>
            <div class="result-thumb-wrapper">
              <img
                v-if="getImageUrl(item.image, 'medium')"
                :src="getImageUrl(item.image, 'medium')"
                :alt="item.name"
                class="result-thumb"
              />
              <div v-else class="result-thumb-fallback">📺</div>
            </div>

            <div class="result-info">
              <div class="result-title">{{ item.name }}</div>
              <div class="result-meta">
                <RatingBadge :rating="item.rating" size="sm" />
                <span class="meta-dot">•</span>
                <span class="meta-year">{{ formatYearRange(item.premiered, item.ended) }}</span>
                <span v-if="item.genres && item.genres[0]" class="meta-dot">•</span>
                <span v-if="item.genres && item.genres[0]" class="meta-genre">{{ item.genres[0] }}</span>
              </div>
            </div>
          </template>

          <!-- Arrow indicator using <img> tag -->
          <img :src="arrowRightIcon" class="result-arrow" alt="Go" />
        </li>
      </ul>

      <!-- Footer "See all results" -->
      <div v-if="displayedResults.length" class="dropdown-footer">
        <button class="see-all-btn" @click="submitSearch">
          <span>See all results for "<strong>{{ query }}</strong>"</span>
          <img :src="arrowRightIcon" class="footer-arrow-icon" alt="View all" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-bar-wrapper {
  position: relative;
  width: 100%;
}

.search-input-box {
  display: flex;
  align-items: center;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  padding: 0.45rem 0.95rem;
  transition: all var(--transition-fast);
}

.search-input-box:focus-within,
.search-input-box.focused {
  border-color: var(--primary);
  background: var(--bg-surface-elevated);
  box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.25);
}

.search-icon-btn {
  background: transparent;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-right: 0.55rem;
}

.search-icon {
  width: 18px;
  height: 18px;
  display: block;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 0.9rem;
  width: 100%;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-input::-webkit-search-cancel-button {
  -webkit-appearance: none;
}

.search-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 248, 240, 0.2);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.clear-btn {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
}

.clear-icon {
  width: 14px;
  height: 14px;
  display: block;
}

/* Dropdown */
.search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg), 0 0 25px rgba(230, 57, 70, 0.2);
  overflow: hidden;
  z-index: 1000;
  backdrop-filter: blur(20px);
}

/* Category Scope Selector Tabs */
.search-scope-tabs {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 0.75rem;
  background: rgba(0, 0, 0, 0.35);
  border-bottom: 1px solid var(--border-subtle);
}

.scope-tab-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.65rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.scope-tab-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.scope-tab-btn.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(230, 57, 70, 0.4);
}

.scope-tab-icon {
  width: 13px;
  height: 13px;
  display: block;
}

.dropdown-status {
  padding: 1.25rem 1rem;
  text-align: center;
  font-size: 0.88rem;
  color: var(--text-secondary);
}

.query-highlight {
  color: var(--accent);
  font-weight: 600;
}

.results-list {
  list-style: none;
  max-height: 420px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.65rem 0.9rem;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 248, 240, 0.04);
  transition: background var(--transition-fast);
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover,
.result-item.active {
  background: rgba(230, 57, 70, 0.16);
}

.result-thumb-wrapper {
  width: 44px;
  height: 62px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--bg-card);
  flex-shrink: 0;
}

.genre-thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(251, 191, 36, 0.12);
  border: 1px solid rgba(251, 191, 36, 0.25);
}

.genre-icon-img {
  width: 24px;
  height: 24px;
}

.person-thumb {
  border-radius: 50%;
  width: 48px;
  height: 48px;
}

.result-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-thumb-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  background: #362a2a;
}

.result-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.result-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-item:hover .result-title,
.result-item.active .result-title {
  color: var(--accent);
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.category-chip {
  display: inline-block;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.actor-chip {
  background: rgba(244, 166, 166, 0.16);
  color: var(--accent);
  border: 1px solid rgba(244, 166, 166, 0.3);
}

.genre-chip {
  background: rgba(251, 191, 36, 0.16);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.meta-dot {
  color: var(--text-muted);
}

.meta-year, .meta-genre, .meta-country {
  font-weight: 500;
}

.result-arrow {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  transition: transform var(--transition-fast);
}

.result-item:hover .result-arrow,
.result-item.active .result-arrow {
  transform: translateX(3px);
}

.dropdown-footer {
  background: rgba(0, 0, 0, 0.35);
  border-top: 1px solid var(--border-subtle);
  padding: 0.5rem 0.75rem;
}

.see-all-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.65rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.see-all-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}

.footer-arrow-icon {
  width: 15px;
  height: 15px;
}
</style>
