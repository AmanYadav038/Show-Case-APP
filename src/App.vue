<script setup>
import Navbar from './components/layout/Navbar.vue'
import Footer from './components/layout/Footer.vue'
import ShowHoverPreview from './components/shows/ShowHoverPreview.vue'
</script>

<template>
  <div class="app-layout">
    <!-- Navigation Bar with Search -->
    <Navbar />

    <!-- Main View Transition -->
    <div class="main-content-wrapper">
      <router-view v-slot="{ Component }">
        <transition name="route-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <!-- Floating Hover Preview Card (Teleported singleton) -->
    <ShowHoverPreview />

    <!-- Site Footer -->
    <Footer />
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content-wrapper {
  flex: 1;
}

/* Route transition */
.route-fade-enter-active,
.route-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.route-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.route-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
