<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSearch } from '../../composables/useSearch.js'
import { formatYearRange, getImageUrl } from '../../utils/formatters.js'
import RatingBadge from '../common/RatingBadge.vue'

const router = useRouter()
const { query, results, isSearching, handleInput, clearSearch } = useSearch()

const isDropdownOpen = ref(false)
const searchContainer = ref(null)
const selectedIndex = ref(-1)

const displayedResults = computed(() => results.value.slice(0, 7))

function onInput(event) {
  const val = event.target.value
  handleInput(val)
  isDropdownOpen.value = val.trim().length > 0
  selectedIndex.value = -1
}

function onFocus() {
  if (query.value.trim().length > 0) {
    isDropdownOpen.value = true
  }
}

function selectShow(show) {
  isDropdownOpen.value = false
  clearSearch()
  router.push({ name: 'show-detail', params: { id: show.id } })
}

function submitSearch() {
  const q = query.value.trim()
  if (!q) return

  // If item is highlighted with arrow keys
  if (selectedIndex.value >= 0 && displayedResults.value[selectedIndex.value]) {
    selectShow(displayedResults.value[selectedIndex.value])
    return
  }

  isDropdownOpen.value = false
  router.push({ name: 'search', query: { q } })
}

function handleKeyDown(e) {
  if (!isDropdownOpen.value) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (selectedIndex.value < displayedResults.value.length - 1) {
      selectedIndex.value++
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (selectedIndex.value > 0) {
      selectedIndex.value--
    } else {
      selectedIndex.value = -1
    }
  } else if (e.key === 'Escape') {
    isDropdownOpen.value = false
  } else if (e.key === 'Enter') {
    e.preventDefault()
    submitSearch()
  }
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
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        type="search"
        :value="query"
        placeholder="Search TV shows, series, genres..."
        class="search-input"
        autocomplete="off"
        aria-label="Search shows"
        @input="onInput"
        @focus="onFocus"
        @keydown="handleKeyDown"
      />

      <!-- Spinner indicator -->
      <div v-if="isSearching" class="search-spinner" aria-label="Searching..."></div>

      <!-- Clear button -->
      <button
        v-else-if="query"
        type="button"
        class="clear-btn"
        aria-label="Clear search"
        @click="clearSearch"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <!-- IMDb-style Live Suggestions Dropdown -->
    <div v-if="isDropdownOpen && query.trim()" class="search-dropdown fade-in">
      <!-- Loading indicator text -->
      <div v-if="isSearching && !displayedResults.length" class="dropdown-status">
        Searching TVMaze database...
      </div>

      <!-- No results notice -->
      <div v-else-if="!isSearching && !displayedResults.length" class="dropdown-status">
        No TV shows found for "<span class="query-highlight">{{ query }}</span>"
      </div>

      <!-- Results list -->
      <ul v-else class="results-list" role="listbox">
        <li
          v-for="(show, index) in displayedResults"
          :key="show.id"
          class="result-item"
          :class="{ 'active': index === selectedIndex }"
          role="option"
          :aria-selected="index === selectedIndex"
          @click="selectShow(show)"
          @mouseenter="selectedIndex = index"
        >
          <!-- Thumbnail -->
          <div class="result-thumb-wrapper">
            <img
              v-if="getImageUrl(show.image, 'medium')"
              :src="getImageUrl(show.image, 'medium')"
              :alt="show.name"
              class="result-thumb"
            />
            <div v-else class="result-thumb-fallback">📺</div>
          </div>

          <!-- Info -->
          <div class="result-info">
            <div class="result-title">{{ show.name }}</div>
            <div class="result-meta">
              <RatingBadge :rating="show.rating" size="sm" />
              <span class="meta-dot">•</span>
              <span class="meta-year">{{ formatYearRange(show.premiered, show.ended) }}</span>
              <span v-if="show.genres && show.genres[0]" class="meta-dot">•</span>
              <span v-if="show.genres && show.genres[0]" class="meta-genre">{{ show.genres[0] }}</span>
            </div>
          </div>

          <!-- Arrow indicator -->
          <svg class="result-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </li>
      </ul>

      <!-- Footer "See all results" -->
      <div v-if="displayedResults.length" class="dropdown-footer">
        <button class="see-all-btn" @click="submitSearch">
          <span>See all results for "<strong>{{ query }}</strong>"</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
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
  border-color: var(--accent-gold);
  background: #1e212d;
  box-shadow: 0 0 0 3px rgba(245, 197, 24, 0.15);
}

.search-icon {
  width: 18px;
  height: 18px;
  color: var(--text-muted);
  flex-shrink: 0;
  margin-right: 0.55rem;
}

.search-input-box:focus-within .search-icon {
  color: var(--accent-gold);
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

/* Remove default webkit search cancel button */
.search-input::-webkit-search-cancel-button {
  -webkit-appearance: none;
}

.search-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: var(--accent-gold);
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
  color: var(--text-muted);
  border-radius: 50%;
  transition: color var(--transition-fast);
}

.clear-btn:hover {
  color: var(--text-primary);
}

.clear-btn svg {
  width: 14px;
  height: 14px;
}

/* Dropdown */
.search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #181922;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 1000;
  backdrop-filter: blur(16px);
}

.dropdown-status {
  padding: 1.25rem 1rem;
  text-align: center;
  font-size: 0.88rem;
  color: var(--text-secondary);
}

.query-highlight {
  color: var(--accent-gold);
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  transition: background var(--transition-fast);
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover,
.result-item.active {
  background: rgba(245, 197, 24, 0.1);
}

.result-thumb-wrapper {
  width: 44px;
  height: 62px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--bg-surface);
  flex-shrink: 0;
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
  background: #232634;
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
  color: var(--accent-gold);
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.meta-dot {
  color: var(--text-muted);
}

.meta-year, .meta-genre {
  font-weight: 500;
}

.result-arrow {
  width: 16px;
  height: 16px;
  color: var(--text-muted);
  flex-shrink: 0;
  transition: transform var(--transition-fast), color var(--transition-fast);
}

.result-item:hover .result-arrow,
.result-item.active .result-arrow {
  color: var(--accent-gold);
  transform: translateX(3px);
}

.dropdown-footer {
  background: rgba(0, 0, 0, 0.25);
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
  transition: all var(--transition-fast);
}

.see-all-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--accent-gold);
}

.see-all-btn svg {
  width: 15px;
  height: 15px;
}
</style>
