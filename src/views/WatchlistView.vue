<script setup>
import { useWatchlist } from '../composables/useWatchlist.js'
import { useI18n } from '../composables/useI18n.js'
import ShowCard from '../components/shows/ShowCard.vue'

const { watchlist } = useWatchlist()
const { t } = useI18n()
</script>

<template>
  <main class="watchlist-page container">
    <div class="watchlist-header">
      <div class="header-left">
        <h1 class="page-title">{{ t('watchlist.title') }}</h1>
        <span class="count-pill">{{ t('watchlist.countPill', { count: watchlist.length }) }}</span>
      </div>
      <p class="page-desc">
        {{ t('watchlist.subtitle') }}
      </p>
    </div>

    <!-- Empty Watchlist State -->
    <div v-if="!watchlist.length" class="empty-watchlist-box">
      <div class="empty-icon">🔖</div>
      <h3 class="empty-title">{{ t('watchlist.emptyTitle') }}</h3>
      <p class="empty-desc">
        {{ t('watchlist.emptyDesc') }}
      </p>
      <router-link to="/" class="browse-btn">
        {{ t('watchlist.discoverBtn') }}
      </router-link>
    </div>

    <!-- Watchlist Grid -->
    <div v-else class="grid-cards fade-in">
      <ShowCard
        v-for="show in watchlist"
        :key="show.id"
        :show="show"
      />
    </div>
  </main>
</template>

<style scoped>
.watchlist-page {
  padding-top: 2rem;
  padding-bottom: 4rem;
}

.watchlist-header {
  margin-bottom: 2rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border-subtle);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 0.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.count-pill {
  font-size: 0.8rem;
  font-weight: 700;
  color: #c7d2fe;
  background: var(--accent-gradient-subtle);
  border: 1px solid var(--border-accent);
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
}

.page-desc {
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.empty-watchlist-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 5rem 1.5rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  max-width: 520px;
  margin: 3rem auto;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-desc {
  font-size: 0.92rem;
  color: var(--text-secondary);
  line-height: 1.55;
  margin-bottom: 1.5rem;
  max-width: 400px;
}

.browse-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: var(--accent-gradient);
  color: #fff;
  font-weight: 800;
  font-size: 0.92rem;
  border-radius: var(--radius-md);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
  transition: all var(--transition-fast);
}

.browse-btn:hover {
  background: var(--accent-gradient-hover);
  transform: translateY(-2px);
}
</style>
