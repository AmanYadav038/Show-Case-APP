<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useWatchlist } from '../../composables/useWatchlist.js'
import SearchBar from '../search/SearchBar.vue'

const router = useRouter()
const { watchlist } = useWatchlist()
const isMobileMenuOpen = ref(false)

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}
</script>

<template>
  <header class="app-header">
    <div class="header-inner container">
      <!-- Left: Logo & Nav Links -->
      <div class="header-left">
        <router-link to="/" class="brand-logo" @click="closeMobileMenu">
          <span class="logo-box">CM</span>
          <span class="logo-text">Cine<span class="text-gold">Maze</span></span>
        </router-link>

        <nav class="desktop-nav">
          <router-link to="/" class="nav-link" active-class="active">
            Dashboard
          </router-link>
          <a href="#genre-drama" class="nav-link" @click="closeMobileMenu">
            Genres
          </a>
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
        <a href="#genre-drama" class="mobile-link" @click="closeMobileMenu">
          Browse Genres
        </a>
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
  background: rgba(13, 14, 18, 0.92);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-subtle);
  width: 100%;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  height: 68px;
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
  gap: 0.6rem;
  font-weight: 800;
  font-size: 1.35rem;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.logo-box {
  background: var(--accent-gold);
  color: #000;
  font-weight: 900;
  font-size: 0.85rem;
  padding: 0.2rem 0.45rem;
  border-radius: var(--radius-sm);
  letter-spacing: 0;
}

.text-gold {
  color: var(--accent-gold);
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
  transition: color var(--transition-fast);
  padding: 0.35rem 0.25rem;
}

.nav-link:hover,
.nav-link.active {
  color: var(--text-primary);
}

.nav-link.active {
  border-bottom: 2px solid var(--accent-gold);
}

.watchlist-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.watchlist-count {
  background: var(--accent-gold);
  color: #000;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.1rem 0.45rem;
  border-radius: var(--radius-full);
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
  gap: 0.85rem;
}

.mobile-link {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-secondary);
  padding: 0.4rem 0;
}

.mobile-link:hover {
  color: var(--accent-gold);
}
</style>
