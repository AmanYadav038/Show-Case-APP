<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWatchlist } from '../../composables/useWatchlist.js'
import { CURATED_GENRES } from '../../composables/useShows.js'
import SearchBar from '../search/SearchBar.vue'

const router = useRouter()
const { watchlist } = useWatchlist()

const isMobileMenuOpen = ref(false)
const isGenreDropdownOpen = ref(false)
const genreDropdownRef = ref(null)

const allNavGenres = ['Top-Rated', ...CURATED_GENRES]

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
  isGenreDropdownOpen.value = false
}

function toggleGenreDropdown() {
  isGenreDropdownOpen.value = !isGenreDropdownOpen.value
}

function selectGenre(genreName) {
  isGenreDropdownOpen.value = false
  closeMobileMenu()
  router.push({ name: 'genre-detail', params: { genre: genreName } })
}

function handleClickOutside(e) {
  if (genreDropdownRef.value && !genreDropdownRef.value.contains(e.target)) {
    isGenreDropdownOpen.value = false
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
  <header class="app-header">
    <div class="header-inner container">
      <!-- Left: Logo & Nav Links -->
      <div class="header-left">
        <router-link to="/" class="brand-logo" @click="closeMobileMenu">
          <div class="logo-icon-wrap">
            <svg class="logo-play-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 3.75C4 2.784 5.048 2.181 5.882 2.667L20.132 10.917C20.963 11.399 20.963 12.601 20.132 13.083L5.882 21.333C5.048 21.819 4 21.216 4 20.25V3.75Z" />
            </svg>
          </div>
          <span class="logo-text">Show<span class="text-gradient">Case</span></span>
        </router-link>

        <nav class="desktop-nav">
          <router-link to="/" class="nav-link" active-class="active">
            Dashboard
          </router-link>

          <!-- Genre Dropdown Menu (Global, works on Watchlist & every view) -->
          <div ref="genreDropdownRef" class="genre-nav-dropdown-wrap">
            <button
              class="nav-link dropdown-toggle"
              :class="{ 'active': $route.name === 'genre-detail' || isGenreDropdownOpen }"
              @click.stop="toggleGenreDropdown"
            >
              <span>Genres</span>
              <svg 
                class="chevron-icon" 
                :class="{ 'rotate': isGenreDropdownOpen }" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2.5"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            <!-- Dropdown Menu Box -->
            <div v-if="isGenreDropdownOpen" class="genre-dropdown-menu fade-in">
              <div class="dropdown-header">Browse by Genre</div>
              <div class="dropdown-grid">
                <button
                  v-for="g in allNavGenres"
                  :key="g"
                  class="genre-item-btn"
                  :class="{ 'selected': $route.params.genre === g }"
                  @click="selectGenre(g)"
                >
                  <span v-if="g === 'Top-Rated'" class="star-icon">⭐</span>
                  <span>{{ g }}</span>
                </button>
              </div>
            </div>
          </div>

          <router-link to="/watchlist" class="nav-link watchlist-link" active-class="active">
            <span>Watchlist</span>
            <span v-if="watchlist.length" class="watchlist-count">
              {{ watchlist.length }}
            </span>
          </router-link>
        </nav>
      </div>

      <!-- Center / Right: Global Search Bar -->
      <div class="header-search">
        <SearchBar />
      </div>

      <!-- Mobile Hamburger Button -->
      <button
        class="mobile-menu-btn"
        :aria-expanded="isMobileMenuOpen"
        aria-label="Toggle navigation"
        @click="toggleMobileMenu"
      >
        <svg v-if="!isMobileMenuOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <!-- Mobile Drawer -->
    <div v-if="isMobileMenuOpen" class="mobile-drawer fade-in">
      <div class="mobile-search-wrap">
        <SearchBar />
      </div>
      <nav class="mobile-nav-links">
        <router-link to="/" class="mobile-link" @click="closeMobileMenu">
          Dashboard
        </router-link>

        <div class="mobile-genre-section">
          <div class="mobile-section-title">Select Genre</div>
          <div class="mobile-genre-chips">
            <button
              v-for="g in allNavGenres"
              :key="g"
              class="mobile-genre-chip"
              :class="{ active: $route.params.genre === g }"
              @click="selectGenre(g)"
            >
              {{ g }}
            </button>
          </div>
        </div>

        <router-link to="/watchlist" class="mobile-link" @click="closeMobileMenu">
          Watchlist ({{ watchlist.length }})
        </router-link>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(21, 19, 19, 0.94);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-subtle);
  width: 100%;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  height: 70px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-shrink: 0;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-weight: 800;
  font-size: 1.4rem;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.logo-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px rgba(230, 57, 70, 0.45);
}

.logo-play-icon {
  width: 16px;
  height: 16px;
  color: #fff;
  margin-left: 2px;
}

.text-gradient {
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.desktop-nav {
  display: none;
  align-items: center;
  gap: 1.25rem;
}

@media (min-width: 860px) {
  .desktop-nav {
    display: flex;
  }
}

.nav-link {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  padding: 0.35rem 0.25rem;
  position: relative;
}

.nav-link:hover,
.nav-link.active {
  color: var(--text-primary);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent-gradient);
  border-radius: var(--radius-full);
}

/* Genre Nav Dropdown */
.genre-nav-dropdown-wrap {
  position: relative;
}

.dropdown-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.chevron-icon {
  width: 14px;
  height: 14px;
  transition: transform var(--transition-fast);
}

.chevron-icon.rotate {
  transform: rotate(180deg);
}

.genre-dropdown-menu {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  width: 360px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 1.15rem;
  box-shadow: var(--shadow-lg), 0 0 25px rgba(230, 57, 70, 0.2);
  z-index: 200;
  backdrop-filter: blur(20px);
}

.dropdown-header {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-subtle);
}

.dropdown-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.4rem;
}

.genre-item-btn {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.65rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  text-align: left;
}

.genre-item-btn:hover {
  background: rgba(230, 57, 70, 0.16);
  color: var(--text-primary);
  transform: translateX(2px);
}

.genre-item-btn.selected {
  background: var(--accent-gradient);
  color: #fff;
}

.star-icon {
  font-size: 0.8rem;
}

.watchlist-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.watchlist-count {
  background: var(--accent-gradient);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.12rem 0.5rem;
  border-radius: var(--radius-full);
  box-shadow: 0 0 10px rgba(230, 57, 70, 0.4);
}

.header-search {
  flex: 1;
  max-width: 520px;
  display: none;
}

@media (min-width: 640px) {
  .header-search {
    display: block;
  }
}

.mobile-menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--text-primary);
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
}

@media (min-width: 860px) {
  .mobile-menu-btn {
    display: none;
  }
}

.mobile-menu-btn svg {
  width: 22px;
  height: 22px;
}

/* Mobile Drawer */
.mobile-drawer {
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

@media (min-width: 860px) {
  .mobile-drawer {
    display: none;
  }
}

.mobile-search-wrap {
  width: 100%;
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mobile-link {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-secondary);
  padding: 0.35rem 0;
}

.mobile-link:hover {
  color: #fff;
}

.mobile-genre-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-subtle);
}

.mobile-section-title {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
}

.mobile-genre-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.mobile-genre-chip {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.3rem 0.65rem;
  background: rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.mobile-genre-chip.active {
  background: var(--accent-gradient);
  color: #fff;
}
</style>
