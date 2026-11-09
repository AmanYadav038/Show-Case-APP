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
  genreLists
} = useShows()

onMounted(() => {
  loadShows()
})
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

    <!-- Main Content with Genre Rows (10 shows per row) -->
    <template v-else>
      <!-- Hero Spotlight Banner -->
      <HeroBanner :shows="featuredShows" />

      <!-- Section: Popular / Top Rated (Top 10 Ranked Shows) -->
      <div id="genre-top-rated">
        <GenreRow
          title="Top Rated TV Shows"
          :shows="topRatedShows"
          genre-key="Top-Rated"
          :is-ranked="true"
        />
      </div>

      <!-- Genre-based Horizontal Rows (10 shows per genre with "View All") -->
      <GenreRow
        v-for="(shows, genreName) in genreLists"
        :key="genreName"
        :title="`${genreName} Shows`"
        :genre-key="genreName"
        :shows="shows.slice(0, 10)"
      />
    </template>
  </main>
</template>

<style scoped>
.dashboard-page {
  padding-top: 1.5rem;
  padding-bottom: 3.5rem;
}
</style>
