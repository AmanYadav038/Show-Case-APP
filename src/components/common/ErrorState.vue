<script setup>
defineProps({
  title: {
    type: String,
    default: 'Unable to Load Content'
  },
  message: {
    type: String,
    default: 'There was a problem fetching TV show data. Please verify your internet connection or try again.'
  },
  showRetry: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['retry'])
</script>

<template>
  <div class="error-container">
    <div class="error-icon-box">
      <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>
    <h3 class="error-title">{{ title }}</h3>
    <p class="error-message">{{ message }}</p>
    <button v-if="showRetry" class="retry-btn" @click="emit('retry')">
      <svg class="retry-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M23 4v6h-6" />
        <path d="M1 20v-6h6" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
      Try Again
    </button>
  </div>
</template>

<style scoped>
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 1.5rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  margin: 2rem auto;
  max-width: 540px;
}

.error-icon-box {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.error-icon {
  width: 28px;
  height: 28px;
  color: #ef4444;
}

.error-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.error-message {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.35rem;
  background: var(--accent-gradient);
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.retry-btn:hover {
  background: var(--accent-gradient-hover);
  transform: translateY(-1px);
}

.retry-icon {
  width: 16px;
  height: 16px;
}
</style>
