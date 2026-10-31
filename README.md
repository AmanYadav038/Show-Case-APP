# ShowCase — TV Shows & Series Explorer

> A modern, responsive Single Page Application (SPA) built with **Vue 3** (Composition API, `<script setup>`) and **Vite**, powered by the open [TVMaze API](https://www.tvmaze.com/api). Features horizontal genre lists sorted by rating, an IMDb-style hover preview popover, live auto-complete search, dedicated genre browsing with dynamic sorting, and local watchlist bookmarking.

---

## 📋 Table of Contents
1. [Key Features](#-key-features)
2. [Architectural Decisions & Rationale](#-architectural-decisions--rationale)
   - [Why Vue 3 & Composition API?](#1-why-vue-3--composition-api-script-setup)
   - [Why Vite as Build Tool?](#2-why-vite-as-the-build-tool)
   - [Why Custom Composables over Pinia/Vuex?](#3-why-custom-reactive-composables-over-piniavuex)
   - [Why Vanilla CSS Tokens over Tailwind/Bootstrap/UI Libraries?](#4-why-vanilla-css-tokens-over-tailwind-or-ui-libraries)
   - [API Service & Caching Strategy](#5-api-service-layer--in-memory-caching-strategy)
   - [Simplified Interaction Architecture](#6-simplified-predictable-interaction-architecture)
3. [Design System & Color Palette](#-design-system--color-palette)
4. [Project Structure](#-project-structure)
5. [How to Run the Application](#-how-to-run-the-application)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Development Server](#development-server)
   - [Running Unit Tests](#running-unit-tests)
   - [Production Build & Preview](#production-build--preview)
   - [Windows One-Click Launchers](#windows-one-click-launchers)
6. [Testing Strategy](#-testing-strategy)
7. [API Endpoints Utilized](#-api-endpoints-utilized)

---

## 🌟 Key Features

* **Dynamic Dashboard with Horizontal Genre Rows**:
  * TV shows fetched from TVMaze and dynamically grouped by genre (Drama, Action, Comedy, Sci-Fi, Thriller, etc.).
  * Shows within each genre are automatically sorted by average rating in descending order.
  * Smooth horizontal scroll navigation via Left (`<`) and Right (`>`) arrow controls.
* **Top-Rated Showcase with Clean Badge Separation**:
  * Displays the highest-rated television shows across all genres.
  * Ranked shows feature a numbered rank badge (`#1`, `#2`, `#3`) at the top-left, and rating badge at the bottom-left of the poster to ensure **zero visual overlap**.
* **IMDb-Style Hover Preview**:
  * Hovering over any show card displays an elegant floating preview popover containing the show's synopsis, premiered year, runtime, genres, rating, and a quick **"Add to Watchlist"** toggle.
* **Global Genre Navigation & Dedicated Genre View**:
  * Persistent **Genres ▾** dropdown in the navigation bar, accessible from any page.
  * Each genre row includes a **"View All →"** link directing to a dedicated full-page collection (`/genre/:genre`).
  * Dedicated genre pages support dynamic multi-criteria sorting:
    * **Rating** (Highest first)
    * **Popularity / Weight**
    * **Release Year** (Newest first)
    * **Title** (A–Z)
* **Instant Search & Autocomplete**:
  * Live debounced search input in the navigation bar with instant drop-down suggestions.
  * Clicking any suggestion opens the show directly; clicking the search button or "See all results" opens the full search view (`/search?q=...`) with genre filters and sorting.
* **Comprehensive Show Detail View**:
  * Detailed header with high-resolution poster, network, schedule, status, language, and official site link.
  * Tabbed episode explorer grouped by seasons.
  * Full cast list with actor photos and character names.
* **Client-Side Watchlist**:
  * Bookmark any show into a personal Watchlist.
  * State persists across browser sessions using `localStorage`.
* **Fully Responsive**:
  * Optimized layouts with CSS Flexbox and Grid adapting seamlessly across mobile, tablet, and desktop screens.

---

## 🏛 Architectural Decisions & Rationale

### 1. Why Vue 3 & Composition API (`<script setup>`)?
* **Modern Reactivity Model**: Vue 3's proxy-based reactivity (`ref`, `computed`, `reactive`) provides fine-grained dependency tracking with zero overhead, automatically tracking dependencies and minimizing unnecessary re-renders.
* **Logical Concern Colocation**: In contrast to Vue 2's Options API (which fragmented logic across `data`, `methods`, and `computed`), the Composition API allows grouping related logic together into self-contained composable functions.
* **Clean Code & Minimal Boilerplate**: Using `<script setup>` significantly reduces boilerplate code—props and emits are declared with compiler macros (`defineProps`, `defineEmits`), and top-level bindings are directly accessible in the template without manual return statements.
* **Style Encapsulation**: Single File Components (SFCs) with `<style scoped>` guarantee style isolation, preventing accidental style leaking across components.

### 2. Why Vite as the Build Tool?
* **Instant Development Startup**: Vite serves source code over native ES modules (ESM). Unlike traditional bundlers (Webpack) that bundle the entire application before serving, Vite starts the dev server immediately regardless of application size.
* **Lightning-Fast Hot Module Replacement (HMR)**: Changes to Vue SFCs reflect in the browser instantly without full page reloads, retaining application state.
* **Production-Optimized Output**: Uses Rollup under the hood with pre-configured tree-shaking, CSS code splitting, and minification.

### 3. Why Custom Reactive Composables over Pinia/Vuex?
* **Minimal Dependencies & Scaffolding**: To fulfill the requirement of keeping external scaffolding and plugins to a minimum, we avoided pulling in heavy external state management libraries like Pinia or Vuex.
* **Module-Scoped Singletons**: In Vue 3, declaring reactive state outside of a composable function creates a module-scoped singleton:
  ```javascript
  // Shared global state between all component instances
  const shows = ref([])
  const isLoaded = ref(false)

  export function useShows() {
    // Shared methods and computed views
    return { shows, isLoaded, loadShows, genreLists }
  }
  ```
* This achieves the exact same global sharing as Pinia (for `shows` and `watchlist`) while keeping the codebase lightweight, transparent, and completely free of boilerplate.

### 4. Why Vanilla CSS Tokens over Tailwind or UI Libraries?
* **Custom Identity & No Cookie-Cutter Templates**: Avoiding component libraries (Vuetify, Bootstrap, Tailwind) allowed us to build an original, custom streaming interface from scratch.
* **Design Token Architecture**: All design variables are centralized in `src/assets/styles/main.css` under the `:root` pseudo-class:
  * Consistent color palette, typography, border radii, shadows, and smooth transitions.
  * Updating a single CSS custom property instantly ripples throughout the entire application.
* **Zero Runtime Styling Overhead**: Vanilla scoped CSS has zero JavaScript runtime footprint compared to CSS-in-JS libraries.

### 5. API Service Layer & In-Memory Caching Strategy
* **Decoupled Architecture (`src/services/tvmazeApi.js`)**: Network requests and TVMaze response mappings are completely decoupled from UI components. Components never make raw `fetch()` calls directly.
* **In-Memory Caching**: Implemented in-memory `Map` caches for:
  * Show catalogue (`/shows`)
  * Individual show details (`/shows/:id`)
  * Episodes and cast lists
  * Search queries (`/search/shows?q=...`)
* **Benefits**: Eliminates redundant network requests when switching views, prevents TVMaze API rate-limiting, and guarantees instant page transitions when revisiting previously loaded shows.
* **Data Sanitization**: Summaries from TVMaze contain raw HTML tags (`<p>`, `<b>`). The service layer cleanses and normalizes summaries using regex utilities before delivering data to components, safeguarding against XSS and maintaining clean typography.

### 6. Simplified, Predictable Interaction Architecture
* **Pure Click-Based Navigation**: Carousel navigation relies on native DOM `scrollBy({ left, behavior: 'smooth' })` triggered by button clicks, eliminating complex scroll-event listener overhead and window resize debouncing.
* **Standard Form Submissions**: Search submission uses standard HTML form behavior (`@submit.prevent`) and direct button clicks rather than custom keydown event tracking, ensuring high accessibility, simplicity, and predictable code flow during code reviews.

---

## 🎨 Design System & Color Palette

The application uses a custom cinema aesthetic:

| Token | Hex / Value | Purpose |
| :--- | :--- | :--- |
| `--bg-primary` | `#151313` | Deep obsidian main page background |
| `--bg-surface` | `#292020` | Surface layer for navigation, cards, and dropdowns |
| `--bg-surface-elevated`| `#362a2a` | Elevated inputs, active pills, and hover states |
| `--primary` | `#E63946` | Vivid Crimson for primary actions, badges, and focus rings |
| `--accent` | `#F4A6A6` | Soft Rose for secondary accents, subtitles, and badges |
| `--text-primary` | `#FFF8F0` | Warm White for primary headings and body text |
| `--text-secondary` | `#d8ccc4` | Soft warm gray for secondary meta information |
| `--text-muted` | `#9b8b84` | Muted captions and placeholders |
| `--rating-gold` | `#fbbf24` | Golden star rating highlights |

---

## 📁 Project Structure

```
c:\Users\AMAN\OneDrive\Desktop\Assignment\
├── public/                     # Static assets
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── main.css        # Global CSS variables, reset, and base styles
│   ├── components/
│   │   ├── common/             # Reusable UI primitives
│   │   │   ├── ErrorState.vue      # Error display with retry trigger
│   │   │   ├── LoadingSkeleton.vue # Shimmer loading skeletons
│   │   │   └── RatingBadge.vue     # Dynamic rating score badge
│   │   ├── layout/
│   │   │   ├── AppFooter.vue       # Site footer
│   │   │   └── Navbar.vue          # Top navigation with search and genre dropdown
│   │   ├── search/
│   │   │   └── SearchBar.vue       # Live autocomplete search bar
│   │   └── shows/
│   │       ├── CastList.vue        # Actor and character cards
│   │       ├── EpisodeList.vue     # Season-based episode breakdown
│   │       ├── GenreRow.vue        # Horizontal show carousel with "View All"
│   │       ├── HeroBanner.vue      # Hero banner featuring top spotlight shows
│   │       ├── ShowCard.vue        # TV show poster card (ranked / unranked)
│   │       └── ShowHoverPreview.vue# Floating hover popover card
│   ├── composables/            # Reusable business logic & state
│   │   ├── useHoverPreview.js  # Hover preview popover position & delay logic
│   │   ├── useSearch.js        # Debounced live search logic
│   │   ├── useShows.js         # Show fetching, genre grouping, and sorting
│   │   └── useWatchlist.js     # Reactive watchlist persisted in localStorage
│   ├── router/
│   │   └── index.js            # Vue Router config (Dashboard, Detail, Genre, Search, Watchlist)
│   ├── services/
│   │   └── tvmazeApi.js        # TVMaze API client with in-memory caching
│   ├── utils/
│   │   └── formatters.js       # Pure utility functions (dates, runtimes, HTML stripping)
│   ├── views/                  # Route view components
│   │   ├── DashboardView.vue   # Main dashboard with hero & genre carousels
│   │   ├── GenreView.vue       # Dedicated genre collection page with sorting
│   │   ├── SearchView.vue      # Full search results page with genre filters
│   │   ├── ShowDetailView.vue  # Full show details, seasons, episodes, and cast
│   │   └── WatchlistView.vue   # User's bookmarked shows view
│   ├── App.vue                 # Root component
│   └── main.js                 # Application entry point
├── tests/
│   └── unit/                   # Vitest unit test suite (34 passing tests)
│       ├── api.spec.js         # API client & caching tests
│       ├── formatters.spec.js  # Utility formatting function tests
│       ├── GenreRow.spec.js    # GenreRow component tests
│       ├── RatingBadge.spec.js # RatingBadge component tests
│       ├── ShowCard.spec.js    # ShowCard ranking & rating tests
│       └── useWatchlist.spec.js# Watchlist composable persistence tests
├── index.html                  # HTML template
├── package.json                # Project dependencies and npm scripts
├── vite.config.js              # Vite configuration
├── run-dev.bat                 # One-click Windows development server launcher
└── run-test.bat                # One-click Windows unit test runner
```

---

## 🚀 How to Run the Application

### Prerequisites
* **Node.js**: `v18.0.0` or later (`v20+` recommended)
* **npm**: `v9.0.0` or later

### Installation
Clone or navigate to the project directory and install dependencies:
```bash
npm install
```

### Development Server
Start the local Vite development server:
```bash
npm run dev
```
Open your browser and navigate to the local URL displayed in the terminal (typically `http://localhost:5173`).

### Running Unit Tests
Execute the automated Vitest test suite:
```bash
npm test
```
All 34 unit tests will execute in headless JSDOM mode and report status in your terminal.

### Production Build & Preview
To create an optimized, minified production build:
```bash
npm run build
```
The output will be placed in the `dist/` directory.

To locally preview the production build:
```bash
npm run preview
```

### Windows One-Click Launchers
For convenience on Windows machines, batch scripts are included in the root folder:
* **`run-dev.bat`**: Starts the development server.
* **`run-test.bat`**: Runs the Vitest unit tests.

---

## 🧪 Testing Strategy

The test suite is built using **Vitest** and **`@vue/test-utils`** with a **`jsdom`** virtual environment, ensuring fast feedback and comprehensive coverage without requiring a physical browser.

### Test Coverage Highlights:
1. **`tests/unit/api.spec.js`**:
   * Validates TVMaze fetch calls for all primary endpoints (`/shows`, `/search/shows`, `/episodes`, `/cast`).
   * Validates in-memory caching mechanism (verifying network is not queried twice for the same resource).
   * Validates error handling when network requests fail.
2. **`tests/unit/formatters.spec.js`**:
   * Tests date and year formatting (`formatYearRange`, `formatPremieredDate`).
   * Tests HTML stripping (`stripHtml`) to prevent injection vulnerabilities.
   * Tests runtime string generation (`formatRuntime`) and fallback poster image resolution (`getImageUrl`).
3. **`tests/unit/RatingBadge.spec.js`**:
   * Tests rating display formatting, empty rating fallbacks, and score-based color coding.
4. **`tests/unit/ShowCard.spec.js`**:
   * Validates standard unranked card rendering.
   * Validates ranked card badge layout separation: confirms the rank badge sits at the top-left while the rating badge sits at the bottom-left to prevent any badge overlapping.
5. **`tests/unit/GenreRow.spec.js`**:
   * Validates rendering of genre titles, show counts, and the **"View All"** navigation component.
   * Validates that empty genre lists do not render unnecessary DOM nodes.
6. **`tests/unit/useWatchlist.spec.js`**:
   * Tests adding, removing, and toggling shows in the watchlist.
   * Tests synchronization and persistence with `localStorage`.

---

## 🌐 API Endpoints Utilized

This project interacts with the public, open TVMaze REST API:

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `https://api.tvmaze.com/shows` | `GET` | Fetches the primary TV show catalogue for genre rows and top-rated ranking. |
| `https://api.tvmaze.com/search/shows?q=:query` | `GET` | Fetches matching shows for live autocomplete and search view. |
| `https://api.tvmaze.com/shows/:id` | `GET` | Fetches comprehensive details for a single TV show. |
| `https://api.tvmaze.com/shows/:id/episodes` | `GET` | Fetches all episodes across all seasons for the show detail view. |
| `https://api.tvmaze.com/shows/:id/cast` | `GET` | Fetches main cast members and character information. |

---

## 💡 Author Notes
* Built with a focus on clean code, strong separation of concerns, and native Vue 3 capabilities.
* No heavyweight third-party component libraries or CSS frameworks were used, ensuring full ownership over every style, animation, and interaction.
