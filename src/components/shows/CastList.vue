<script setup>
import { computed, getCurrentInstance } from 'vue'
import { useDataSaver } from '../../composables/useDataSaver.js'
import { useI18n } from '../../composables/useI18n.js'

const props = defineProps({
  cast: {
    type: Array,
    default: () => []
  }
})

const instance = getCurrentInstance()
const { isDataSaverActive } = useDataSaver()
const { t } = useI18n()
const displayedCast = computed(() => props.cast.slice(0, 16))

function goToActorShows(person) {
  if (!person?.name) return
  const router = instance?.appContext?.config?.globalProperties?.$router
  if (router && typeof router.push === 'function') {
    router.push({
      name: 'search',
      query: { q: person.name, personId: person.id }
    })
  } else if (typeof window !== 'undefined') {
    window.location.hash = `#/search?q=${encodeURIComponent(person.name)}&personId=${person.id}`
  }
}
</script>

<template>
  <div v-if="displayedCast && displayedCast.length" class="cast-section">
    <div class="section-header">
      <div class="accent-bar"></div>
      <h3 class="section-title">{{ t('showDetail.topCast') }}</h3>
      <span class="cast-count">({{ cast.length }})</span>
    </div>

    <div class="cast-grid">
      <div
        v-for="(item, index) in displayedCast"
        :key="index"
        class="cast-member-card"
        role="button"
        tabindex="0"
        :title="`View shows starring ${item.person?.name}`"
        :aria-label="`View shows starring ${item.person?.name}`"
        @click="goToActorShows(item.person)"
        @keydown.enter="goToActorShows(item.person)"
      >
        <div class="avatar-wrap">
          <img
            v-if="!isDataSaverActive && item.person?.image?.medium"
            :src="item.person.image.medium"
            :alt="item.person.name"
            class="avatar-img"
            loading="lazy"
          />
          <div v-else class="avatar-fallback">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </div>

        <div class="cast-info">
          <h4 class="actor-name" :title="item.person?.name">{{ item.person?.name }}</h4>
          <p class="character-name" :title="item.character?.name">
            {{ item.character?.name || 'Self' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cast-section {
  margin-top: 2.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.25rem;
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

.cast-count {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.cast-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .cast-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1.5rem;
  }
}

.cast-member-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 1rem 0.75rem;
  cursor: pointer;
  transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.cast-member-card:hover {
  transform: translateY(-4px);
  border-color: var(--primary);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
}

.cast-member-card:hover .actor-name {
  color: var(--primary);
}

.avatar-wrap {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 0.75rem;
  background: var(--bg-surface);
  border: 2px solid var(--border-subtle);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  background: #202330;
}

.avatar-fallback svg {
  width: 38px;
  height: 38px;
}

.cast-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  width: 100%;
}

.actor-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.character-name {
  font-size: 0.76rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
