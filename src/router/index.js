import { createRouter, createWebHistory } from 'vue-router'
import { syncDataSaverOnNavigation } from '../composables/useDataSaver.js'
import DashboardView from '../views/DashboardView.vue'
import ShowDetailView from '../views/ShowDetailView.vue'
import SearchView from '../views/SearchView.vue'
import WatchlistView from '../views/WatchlistView.vue'
import GenreView from '../views/GenreView.vue'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    meta: { title: 'ShowCase — Discover Popular TV Shows & Genres' }
  },
  {
    path: '/show/:id',
    name: 'show-detail',
    component: ShowDetailView,
    props: true,
    meta: { title: 'Show Details — ShowCase' }
  },
  {
    path: '/genre/:genre',
    name: 'genre-detail',
    component: GenreView,
    props: true,
    meta: { title: 'Genre Collection — ShowCase' }
  },
  {
    path: '/search',
    name: 'search',
    component: SearchView,
    meta: { title: 'Search TV Shows — ShowCase' }
  },
  {
    path: '/watchlist',
    name: 'watchlist',
    component: WatchlistView,
    meta: { title: 'My Watchlist — ShowCase' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0, behavior: 'smooth' }
  }
})

router.afterEach((to) => {
  syncDataSaverOnNavigation()
  if (to.meta?.title) {
    document.title = to.meta.title
  }
})

export default router
