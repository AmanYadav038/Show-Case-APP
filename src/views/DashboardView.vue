<script setup>
import { onMounted } from 'vue'
import { useShows } from '../composables/useShows.js'
import HeroBanner from '../components/shows/HeroBanner.vue'
import GenreRow from '../components/shows/GenreRow.vue'
import LoadingSkeleton from '../components/common/LoadingSkeleton.vue'
import ErrorState from '../components/common/ErrorState.vue'

const {
  loading,
  error,
  isLoaded,
  loadShows,
  topRatedShows,
  featuredShows,
  genreLists,
  availableGenres
} = useShows()

onMounted(() => {
  loadShows()
})

function scrollToGenre(genreName) {
  const el = document.getElementById(`genre-${genreName.toLowerCase()}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <main class="dashboard-page container">
    <!-- Loading State -->
    <template v-if="loading && !isLoaded">
      <LoadingSkeleton type="hero" />
      <LoadingSkeleton v-for="i in 3" :key="i" type="row" :count="6" />
    </template>

    <!-- Error State -->
    <template v-else-if="error">
      <ErrorState
        title="Failed to Load TV Shows"
        :message="error"
        @retry="loadShows(true)"
      />
    </template>

    <!-- Main Content -->
    <template v-else>
      <!-- Hero Spotlight Banner -->
      <HeroBanner :shows="featuredShows" />

      <!-- Quick Genre Jump Pills -->
      <div class="genre-nav-bar">
        <span class="genre-nav-label">Jump to:</span>
        <div class="genre-pill-scroll">
          <button
            class="genre-jump-btn"
            @click="scrollToGenre('top-rated')"
          >
            ⭐ Top Rated
          </button>
          <button
            v-for="genre in availableGenres"
            :key="genre.name"
            class="genre-jump-btn"
            @click="scrollToGenre(genre.name)"
          >
            {{ genre.name }}
          </button>
        </div>
      </div>

      <!-- Section: Popular / Top Rated (Across all genres) -->
      <div id="genre-top-rated">
        <GenreRow
          title="Top Rated TV Shows"
          :shows="topRatedShows"
          genre-key="top-rated"
          :is-ranked="true"
        />
      </div>

      <!-- Genre-based Horizontal Rows -->
      <GenreRow
        v-for="(shows, genreName) in genreLists"
        :key="genreName"
        :title="`${genreName} Shows`"
        :genre-key="genreName"
        :shows="shows"
      />
    </template>
  </main>
</template>

<style scoped>
.dashboard-page {
  padding-top: 1.5rem;
  padding-bottom: 3rem;
}

.genre-nav-bar {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 2.25rem;
  padding: 0.75rem 1rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.genre-nav-label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.genre-pill-scroll {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
}

.genre-pill-scroll::-webkit-scrollbar {
  display: none;
}

.genre-jump-btn {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.06);
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
}

.genre-jump-btn:hover {
  background: var(--accent-gold);
  color: #000;
  transform: translateY(-1px);
}
</style>
