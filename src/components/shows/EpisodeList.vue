<script setup>
import { ref, computed } from 'vue'
import { useDataSaver } from '../../composables/useDataSaver.js'
import { useI18n } from '../../composables/useI18n.js'
import { stripHtml, formatRating, formatRuntime } from '../../utils/formatters.js'
import RatingBadge from '../common/RatingBadge.vue'

const props = defineProps({
  episodes: {
    type: Array,
    default: () => []
  }
})

const { isDataSaverActive } = useDataSaver()
const { t } = useI18n()

// Group episodes by season
const seasonsMap = computed(() => {
  const map = {}
  for (const ep of props.episodes) {
    const s = ep.season || 1
    if (!map[s]) {
      map[s] = []
    }
    map[s].push(ep)
  }
  return map
})

const seasonNumbers = computed(() => {
  return Object.keys(seasonsMap.value)
    .map(Number)
    .sort((a, b) => a - b)
})

const selectedSeason = ref(1)

// Update default season once seasons are available
if (seasonNumbers.value.length > 0) {
  selectedSeason.value = seasonNumbers.value[0]
}

const currentSeasonEpisodes = computed(() => {
  return seasonsMap.value[selectedSeason.value] || []
})
</script>

<template>
  <div v-if="episodes && episodes.length" class="episodes-section">
    <div class="episodes-header">
      <div class="header-left">
        <div class="accent-bar"></div>
        <h3 class="section-title">{{ t('showDetail.episodes') }}</h3>
        <span class="episodes-total">{{ t('showDetail.episodesTotal', { count: episodes.length }) }}</span>
      </div>

      <!-- Season Tabs -->
      <div class="season-selector-wrapper">
        <label for="season-select" class="season-label">{{ t('showDetail.seasonSelect') }}</label>
        <select
          id="season-select"
          v-model="selectedSeason"
          class="season-dropdown"
        >
          <option
            v-for="s in seasonNumbers"
            :key="s"
            :value="s"
          >
            {{ t('showDetail.seasonOption', { season: s, count: seasonsMap[s].length }) }}
          </option>
        </select>
      </div>
    </div>

    <!-- Episodes List -->
    <div class="episodes-list">
      <div
        v-for="ep in currentSeasonEpisodes"
        :key="ep.id"
        class="episode-card"
      >
        <!-- Ep Thumbnail -->
        <div class="ep-thumb-wrapper">
          <img
            v-if="!isDataSaverActive && ep.image?.medium"
            :src="ep.image.medium"
            :alt="ep.name"
            class="ep-thumb-img"
            loading="lazy"
          />
          <div v-else class="ep-thumb-fallback">
            <span>S{{ ep.season }}E{{ ep.number }}</span>
          </div>
          <span class="ep-number-tag">E{{ ep.number }}</span>
        </div>

        <!-- Ep Info -->
        <div class="ep-info">
          <div class="ep-title-row">
            <h4 class="ep-title">
              {{ ep.number }}. {{ ep.name }}
            </h4>
            <div class="ep-meta">
              <RatingBadge v-if="ep.rating?.average" :rating="ep.rating" size="sm" />
              <span v-if="ep.runtime" class="ep-runtime">{{ formatRuntime(ep.runtime) }}</span>
              <span v-if="ep.airdate" class="ep-airdate">{{ ep.airdate }}</span>
            </div>
          </div>

          <p class="ep-summary">
            {{ stripHtml(ep.summary, 160) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.episodes-section {
  margin-top: 2.75rem;
}

.episodes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.accent-bar {
  width: 4px;
  height: 20px;
  background: var(--accent-gradient);
  border-radius: var(--radius-full);
  box-shadow: 0 0 10px rgba(230, 57, 70, 0.45);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
}

.episodes-total {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.season-selector-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.season-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.season-dropdown {
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-light);
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0.45rem 0.85rem;
  border-radius: var(--radius-md);
  outline: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.season-dropdown:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.25);
}

.episodes-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.episode-card {
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.9rem;
  gap: 1rem;
  transition: border-color var(--transition-fast);
}

@media (min-width: 640px) {
  .episode-card {
    flex-direction: row;
    align-items: flex-start;
  }
}

.episode-card:hover {
  border-color: var(--border-light);
}

.ep-thumb-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--bg-surface);
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .ep-thumb-wrapper {
    width: 160px;
  }
}

.ep-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ep-thumb-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--text-muted);
  background: #202330;
  font-size: 0.9rem;
}

.ep-number-tag {
  position: absolute;
  top: 6px;
  left: 6px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.ep-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ep-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ep-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.ep-meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.ep-runtime, .ep-airdate {
  font-weight: 500;
}

.ep-summary {
  font-size: 0.85rem;
  line-height: 1.5;
  color: #a0a6b7;
}
</style>
