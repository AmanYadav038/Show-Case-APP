# ShowCase — TV Shows Explorer

A responsive single-page web application built with **Vue 3** and **Vite**, powered by the open [TVMaze REST API](https://www.tvmaze.com/api). The application displays popular TV shows organized by genre, top-rated rankings, an IMDb-style hover preview popover, live search auto-completion, dedicated genre browsing with multi-criteria sorting, and a client-side watchlist persisted in `localStorage`.

---

## Why Vue.js for this Application?

Vue 3 was chosen as the frontend framework for this project for several concrete technical reasons:

1. **Fine-Grained Reactivity for Data-Dense Dashboards**  
   The application processes hundreds of show objects fetched from TVMaze, dynamically grouping them into curated genre lists and sorting them by rating. Vue 3’s Proxy-based reactivity system (`ref`, `computed`) tracks dependencies at the property level. When a user bookmarks a show or changes a sort dropdown, only the affected DOM nodes update rather than triggering whole-tree re-renders.

2. **Composition API (`<script setup>`) for Clean Logic Extraction**  
   Instead of fragmenting code across `data`, `methods`, and `computed` options, the Composition API allows related state and methods to be colocated into reusable composables (`useShows`, `useWatchlist`, `useSearch`, `useHoverPreview`). This creates clean boundaries between data fetching, user interaction, and presentation.

3. **Single File Components (SFC) with Scoped Styling**  
   Each component encapsulates its template, logic, and styles in a single `.vue` file. The `<style scoped>` attribute ensures that component-specific CSS cannot leak or cause unintended side effects across other views, eliminating the need for complex CSS naming conventions like BEM.

4. **Built-in Transition System and Vue Router Integration**  
   Vue provides first-class primitives for page transitions. Wrapping `<router-view>` in `<transition mode="out-in">` enabled smooth page-fade animations between views without pulling in external animation libraries.

5. **Minimal Boilerplate & Scaffolding**  
   In alignment with the requirement to avoid heavy boilerplates and plugins, Vue 3 provides built-in reactivity, state management, and template compilation with almost zero 0setup overhead. We avoided heavy state libraries (like Pinia or Vuex) by leveraging Vue's native reactive primitives as module-level singletons.

---

## Best Coding Practices Applied

### 1. Separation of Concerns & Clean Architecture
The codebase is structured into distinct layers with clear responsibilities:
* **API Service Layer (`src/services/tvmazeApi.js`)**: All `fetch` calls, URL construction, and response parsing live here. Components never make raw HTTP calls. An in-memory cache (`Map`) prevents duplicate network requests during back-and-forth navigation.
* **Composables Layer (`src/composables/`)**: Business logic and stateful operations are abstracted into reusable functions (`useShows`, `useWatchlist`, `useSearch`, `useHoverPreview`).
* **Presentation Components (`src/components/`)**: UI components (`ShowCard`, `RatingBadge`, `GenreRow`, `CastList`, `EpisodeList`) receive data via props and emit events, keeping them decoupled from data fetching.
* **Pure Utility Functions (`src/utils/formatters.js`)**: Date formatting, runtime parsing, and HTML stripping are isolated into pure functions with zero side effects, making them simple to unit test.

### 2. Zero External UI Libraries (Vanilla CSS with Design Tokens)
No component libraries (such as Vuetify, Bootstrap, or Tailwind) were used. The interface was crafted from scratch using vanilla CSS and centralized custom properties in `src/assets/styles/main.css`:
* Consistent design tokens for backgrounds, crimson/rose accents, text colors, and border radii.
* Responsive layouts built with CSS Grid and Flexbox.
* Text truncation handled natively with `-webkit-line-clamp`.

### 3. Performance & Memory Optimizations
* **Teleported Singleton Pattern**: Instead of rendering a hidden hover preview inside every single `ShowCard` (which would bloat the DOM with 100+ duplicate popovers), a single `<ShowHoverPreview />` is mounted at the root in `App.vue` and teleports to `<body>`. It calculates its position dynamically when any card is hovered.
* **Debounced Inputs**: Live search and hover previews use debouncing (250ms) to avoid triggering unnecessary API requests or flickering popovers when the mouse moves across cards.
* **Native Smooth Scrolling**: Horizontal genre carousels use native DOM `scrollBy({ left, behavior: 'smooth' })`, calculating a responsive distance based on `clientWidth * 0.75` without requiring external carousel dependencies.

### 4. User Experience & Defensive Programming
* **Layout Stability (No Cumulative Layout Shift)**: `LoadingSkeleton.vue` mirrors the exact dimensions and aspect ratios (`aspect-ratio: 2 / 3`) of the cards and banners, preventing content jump when images finish loading.
* **Resilient Error Handling**: The `ErrorState.vue` component provides user-friendly error feedback with retry triggers (`@retry="loadShows(true)"`).
* **Cross-Environment Storage Safety**: The watchlist composable safely checks for storage availability, avoiding crashes in strict privacy modes or restricted Node/browser environments.

### 5. Automated Unit Testing
A suite of 47 unit tests built with **Vitest** and **`@vue/test-utils`** runs in a headless JSDOM environment across 9 test suites, covering:
* Pure utility transformations (date ranges, runtimes, HTML entity stripping).
* API service mocking and in-memory cache verification.
* Watchlist state mutations and storage persistence.
* Hover preview popover timing, debounce logic, and cancellation.
* Component rendering, prop handling, skeleton shapes, error recovery, and badge placement.

---

## How to Run the Project

### Prerequisites
* **Node.js**: v18.0.0 or higher (v20+ recommended)
* **npm**: v9.0.0 or higher

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Once started, open the local URL shown in your terminal (typically `http://localhost:5173`).

### 3. Run Unit Tests
```bash
npm test
```
Runs all 47 Vitest unit tests in headless mode.

### 4. Build for Production
```bash
npm run build
```
Generates an optimized, minified production bundle in the `dist/` directory.

### 5. Preview Production Build
```bash
npm run preview
```
