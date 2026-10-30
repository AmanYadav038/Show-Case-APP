import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import ShowDetailView from '../views/ShowDetailView.vue'
import SearchView from '../views/SearchView.vue'
import WatchlistView from '../views/WatchlistView.vue'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    meta: { title: 'CineMaze — Discover Popular TV Shows' }
  },
  {
    path: '/show/:id',
    name: 'show-detail',
    component: ShowDetailView,
    props: true,
    meta: { title: 'TV Show Details' }
  },
  {
    path: '/search',
    name: 'search',
    component: SearchView,
    meta: { title: 'Search TV Shows' }
  },
  {
    path: '/watchlist',
    name: 'watchlist',
    component: WatchlistView,
    meta: { title: 'My Watchlist' }
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
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0, behavior: 'smooth' }
  }
})

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = to.meta.title
  }
})

export default router
