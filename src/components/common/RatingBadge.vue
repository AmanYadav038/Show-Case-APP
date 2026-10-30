<script setup>
import { computed } from 'vue'
import { formatRating } from '../../utils/formatters.js'

const props = defineProps({
  rating: {
    type: [Number, Object, String],
    default: null
  },
  size: {
    type: String,
    default: 'md', // 'sm', 'md', 'lg'
    validator: val => ['sm', 'md', 'lg'].includes(val)
  },
  showMax: {
    type: Boolean,
    default: false
  }
})

const formatted = computed(() => formatRating(props.rating))
const hasRating = computed(() => formatted.value !== '—')
</script>

<template>
  <div 
    class="rating-badge"
    :class="[`badge-${size}`, { 'badge-empty': !hasRating }]"
    :title="hasRating ? `Rating: ${formatted} / 10` : 'Not yet rated'"
  >
    <svg class="star-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
    <span class="rating-value">{{ formatted }}</span>
    <span v-if="showMax && hasRating" class="rating-max">/10</span>
  </div>
</template>

<style scoped>
.rating-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(10, 12, 20, 0.82);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-sm);
  color: #fff;
  font-weight: 700;
  line-height: 1;
  transition: transform var(--transition-fast);
}

.star-icon {
  color: var(--rating-gold);
  flex-shrink: 0;
  filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.4));
}

.rating-value {
  letter-spacing: -0.01em;
}

.rating-max {
  font-size: 0.75em;
  color: var(--text-muted);
  font-weight: 500;
}

.badge-empty {
  opacity: 0.6;
}

.badge-empty .star-icon {
  color: var(--text-muted);
  filter: none;
}

/* Sizes */
.badge-sm {
  padding: 0.22rem 0.5rem;
  font-size: 0.75rem;
}
.badge-sm .star-icon {
  width: 12px;
  height: 12px;
}

.badge-md {
  padding: 0.32rem 0.65rem;
  font-size: 0.85rem;
}
.badge-md .star-icon {
  width: 15px;
  height: 15px;
}

.badge-lg {
  padding: 0.45rem 0.85rem;
  font-size: 1.1rem;
}
.badge-lg .star-icon {
  width: 20px;
  height: 20px;
}
</style>
