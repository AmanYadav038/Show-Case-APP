<script setup>
defineProps({
  count: {
    type: Number,
    default: 6
  },
  type: {
    type: String,
    default: 'row', // 'row' | 'grid' | 'hero' | 'detail'
    validator: val => ['row', 'grid', 'hero', 'detail'].includes(val)
  }
})
</script>

<template>
  <div v-if="type === 'hero'" class="skeleton-hero">
    <div class="skeleton-shimmer skeleton-hero-backdrop"></div>
    <div class="skeleton-hero-content">
      <div class="skeleton-shimmer skeleton-badge"></div>
      <div class="skeleton-shimmer skeleton-title"></div>
      <div class="skeleton-shimmer skeleton-text"></div>
      <div class="skeleton-shimmer skeleton-text short"></div>
      <div class="skeleton-shimmer skeleton-btn"></div>
    </div>
  </div>

  <div v-else-if="type === 'row'" class="skeleton-row-container">
    <div class="skeleton-shimmer skeleton-row-header"></div>
    <div class="skeleton-row-scroll">
      <div v-for="i in count" :key="i" class="skeleton-card">
        <div class="skeleton-shimmer skeleton-poster"></div>
        <div class="skeleton-shimmer skeleton-card-title"></div>
        <div class="skeleton-shimmer skeleton-card-meta"></div>
      </div>
    </div>
  </div>

  <div v-else-if="type === 'grid'" class="grid-cards">
    <div v-for="i in count" :key="i" class="skeleton-card">
      <div class="skeleton-shimmer skeleton-poster"></div>
      <div class="skeleton-shimmer skeleton-card-title"></div>
      <div class="skeleton-shimmer skeleton-card-meta"></div>
    </div>
  </div>

  <div v-else-if="type === 'detail'" class="skeleton-detail">
    <div class="skeleton-shimmer skeleton-detail-backdrop"></div>
    <div class="container skeleton-detail-body">
      <div class="skeleton-shimmer skeleton-detail-poster"></div>
      <div class="skeleton-detail-info">
        <div class="skeleton-shimmer skeleton-title"></div>
        <div class="skeleton-shimmer skeleton-card-meta"></div>
        <div class="skeleton-shimmer skeleton-text"></div>
        <div class="skeleton-shimmer skeleton-text"></div>
        <div class="skeleton-shimmer skeleton-text short"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-shimmer {
  animation: pulseSkeleton 1.5s ease-in-out infinite;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-sm);
}

/* Hero Skeleton */
.skeleton-hero {
  position: relative;
  width: 100%;
  height: 460px;
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: 2.5rem;
  display: flex;
  align-items: flex-end;
  padding: 3rem;
}

.skeleton-hero-backdrop {
  position: absolute;
  inset: 0;
}

.skeleton-hero-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 580px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-badge {
  width: 120px;
  height: 24px;
}

.skeleton-title {
  width: 80%;
  height: 42px;
  border-radius: var(--radius-md);
}

.skeleton-text {
  width: 100%;
  height: 18px;
}

.skeleton-text.short {
  width: 60%;
}

.skeleton-btn {
  width: 160px;
  height: 44px;
  border-radius: var(--radius-md);
  margin-top: 0.5rem;
}

/* Row Skeleton */
.skeleton-row-container {
  margin-bottom: 2.5rem;
}

.skeleton-row-header {
  width: 220px;
  height: 28px;
  margin-bottom: 1.25rem;
}

.skeleton-row-scroll {
  display: flex;
  gap: 1.25rem;
  overflow: hidden;
}

.skeleton-card {
  flex: 0 0 170px;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

@media (min-width: 768px) {
  .skeleton-card {
    flex: 0 0 195px;
  }
}

.skeleton-poster {
  width: 100%;
  aspect-ratio: 2 / 3;
  border-radius: var(--radius-md);
}

.skeleton-card-title {
  width: 85%;
  height: 16px;
}

.skeleton-card-meta {
  width: 50%;
  height: 13px;
}

/* Detail Skeleton */
.skeleton-detail {
  position: relative;
  min-height: 80vh;
}

.skeleton-detail-backdrop {
  height: 380px;
  width: 100%;
}

.skeleton-detail-body {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: -120px;
  position: relative;
  z-index: 2;
}

@media (min-width: 768px) {
  .skeleton-detail-body {
    flex-direction: row;
    align-items: flex-start;
  }
}

.skeleton-detail-poster {
  width: 260px;
  aspect-ratio: 2 / 3;
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.skeleton-detail-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
