<script setup>
import { ref } from 'vue'
import { useDataSaver } from '../../composables/useDataSaver.js'

const { isDataSaverActive, toggleDataSaver } = useDataSaver()

const toastMessage = ref('')
let toastTimer = null

function handleClick() {
  const isNowActive = toggleDataSaver()
  if (toastTimer) clearTimeout(toastTimer)

  if (isNowActive) {
    toastMessage.value = '⚡ Low-Res Mode ON: Resolution will be reduced on further page redirections'
  } else {
    toastMessage.value = '🖼️ High-Res Mode ON: High resolution will be restored on further page redirections'
  }

  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 3500)
}
</script>

<template>
  <div class="data-saver-fab-container">
    <!-- Feedback Toast -->
    <transition name="toast-pop">
      <div v-if="toastMessage" class="fab-toast-bubble">
        <span class="toast-dot" :class="{ active: isDataSaverActive }"></span>
        <span class="toast-text">{{ toastMessage }}</span>
      </div>
    </transition>

    <!-- Floating Action Button -->
    <button
      class="data-saver-fab"
      :class="{ 'fab-active': isDataSaverActive }"
      :title="isDataSaverActive ? 'Disable Low-Res Mode (Restores HD on next page)' : 'Enable Low-Res Mode (Reduces resolution on next page)'"
      :aria-label="isDataSaverActive ? 'Low-res mode active. Click to restore HD on next page.' : 'HD mode active. Click to reduce resolution on next page.'"
      :aria-pressed="isDataSaverActive"
      @click="handleClick"
    >
      <!-- Mode Badge Pill -->
      <span class="mode-badge" :class="{ 'badge-active': isDataSaverActive }">
        {{ isDataSaverActive ? 'LITE' : 'HD' }}
      </span>

      <!-- Icon: High-Res Photo vs Low-Res Eco/Flash -->
      <div class="fab-icon-wrap">
        <!-- Low-Res / Data Saver Active Icon (Lightning / Speed Gauge) -->
        <svg
          v-if="isDataSaverActive"
          class="fab-icon icon-lightning"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>

        <!-- Normal / HD Mode Icon (Image / Photo Frame) -->
        <svg
          v-else
          class="fab-icon icon-photo"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>

      <span class="fab-tooltip">
        {{ isDataSaverActive ? 'Restore HD on next page' : 'Reduce resolution on next page' }}
      </span>
    </button>
  </div>
</template>

<style scoped>
.data-saver-fab-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none;
}

.data-saver-fab {
  pointer-events: auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full, 9999px);
  background: rgba(28, 22, 22, 0.94);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  color: var(--text-primary, #ffffff);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  outline: none;
}

.data-saver-fab:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(230, 57, 70, 0.35);
}

.data-saver-fab:active {
  transform: translateY(0) scale(0.97);
}

/* Active State (Data Saver ON) */
.data-saver-fab.fab-active {
  background: linear-gradient(135deg, rgba(46, 26, 26, 0.95) 0%, rgba(30, 18, 18, 0.95) 100%);
  border-color: rgba(230, 57, 70, 0.65);
  color: #ff6b6b;
  box-shadow: 0 8px 24px rgba(230, 57, 70, 0.35), 0 0 16px rgba(230, 57, 70, 0.2);
}

.mode-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  padding: 0.15rem 0.42rem;
  border-radius: var(--radius-full, 9999px);
  background: var(--bg-surface-elevated, #2a2020);
  border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.15));
  color: var(--text-muted, #94a3b8);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  transition: all 0.2s ease;
}

.mode-badge.badge-active {
  background: #e63946;
  color: #ffffff;
  border-color: #ff6b6b;
  box-shadow: 0 2px 8px rgba(230, 57, 70, 0.5);
  animation: pulse-glow 2s infinite ease-in-out;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(230, 57, 70, 0.5);
  }
  50% {
    box-shadow: 0 2px 14px rgba(230, 57, 70, 0.85);
  }
}

.fab-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab-icon {
  width: 24px;
  height: 24px;
  transition: transform 0.25s ease;
}

.icon-lightning {
  stroke: #ff6b6b;
  fill: rgba(230, 57, 70, 0.2);
}

.icon-photo {
  stroke: var(--text-secondary, #cbd5e1);
}

.data-saver-fab:hover .fab-icon {
  transform: rotate(6deg) scale(1.1);
}

/* Hover Tooltip */
.fab-tooltip {
  position: absolute;
  right: 68px;
  background: rgba(20, 16, 16, 0.95);
  color: var(--text-secondary, #cbd5e1);
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.12));
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
  pointer-events: none;
  opacity: 0;
  transform: translateX(6px);
  transition: all 0.2s ease;
}

.data-saver-fab:hover .fab-tooltip {
  opacity: 1;
  transform: translateX(0);
}

/* Toast Message Bubble */
.fab-toast-bubble {
  pointer-events: auto;
  margin-bottom: 0.75rem;
  background: rgba(22, 18, 18, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: var(--text-primary, #ffffff);
  padding: 0.55rem 0.95rem;
  border-radius: var(--radius-md, 8px);
  font-size: 0.82rem;
  font-weight: 600;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 290px;
  backdrop-filter: blur(10px);
}

.toast-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94a3b8;
  flex-shrink: 0;
}

.toast-dot.active {
  background: #e63946;
  box-shadow: 0 0 6px #e63946;
}

.toast-pop-enter-active,
.toast-pop-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-pop-enter-from,
.toast-pop-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.95);
}

@media (max-width: 768px) {
  .data-saver-fab-container {
    bottom: 1.25rem;
    right: 1.25rem;
  }

  .data-saver-fab {
    width: 48px;
    height: 48px;
  }

  .fab-icon {
    width: 20px;
    height: 20px;
  }

  .fab-tooltip {
    display: none;
  }
}
</style>
