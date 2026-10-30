# CineMaze — TV Shows & Series Guide

> A Vue 3 application built with modern frontend best practices, utilizing the open [TVMaze API](https://www.tvmaze.com/api) to showcase popular TV shows grouped by genre, featuring IMDb-style navigation, rich hover previews, live search autocomplete, and detailed show insights.

---

## 🌟 Key Features & Requirements Met

### 1. Genre-Based Horizontal Lists & Popularity Sorting
- **Horizontal Carousels (`GenreRow.vue`)**: Responsive horizontal scrollers with smooth controls (left/right navigation arrows, touch-swipe gestures, and keyboard navigation).
- **Curated Genres**: Lists for **Action**, **Drama**, **Science-Fiction**, **Comedy**, **Thriller**, **Crime**, **Animation**, **Adventure**, **Mystery**, and more.
- **Popularity & Rating Ordering**: Shows within each genre are sorted dynamically by rating (`rating.average` descending) and platform popularity (`weight`), putting top-rated shows front and center.
- **Top Rated Row**: Highlighted showcase with numbered rankings (`#1`, `#2`, etc.).

### 2. IMDb-Style UX & Hover Preview Details
- **Hover Detail Cards (`ShowHoverPreview.vue`)**:
  - Teleported, singleton floating preview card that appears on hover with natural debounce.
  - Displays poster thumbnail, show title, IMDb star rating (`⭐ 8.9 / 10`), premiered year/range, runtime, running status, genre tags, cleaned synopsis snippet, and quick actions ("View Details", "Watchlist").
  - Smart positioning with viewport collision detection so it never clips off-screen or inside horizontal scroll boundaries.
- **Cinema Dark Theme**: Inspired by IMDb & modern cinema streaming platforms with dark charcoal surfaces, gold badges (`#f5c518`), smooth elevation shadows, and clean typography (`Plus Jakarta Sans`).

### 3. Dedicated TV Show Details Screen (`/show/:id`)
- Clicking any show navigates smoothly to the dedicated show details view.
- **Features included**:
  - High-res poster and cinematic blurred backdrop banner.
  - Title, premiered year, runtime, type, status, and network/web channel info.
  - Full unescaped & cleaned overview/synopsis.
  - Broadcast schedule (e.g. `Sundays at 21:00`).
  - Top Cast list with character names, actor names, and headshot photos (`embed[]=cast`).
  - Season-by-season episode explorer with season dropdown, episode thumbnails, air dates, runtimes, and episode synopses (`embed[]=episodes`).
  - "More Like This" recommendations engine matching shows with shared genres.
  - "Back to Dashboard" navigation and external link to official website.

### 4. Search Functionality
- **Instant Live Autocomplete (`SearchBar.vue`)**:
  - Global search in the navbar with debounced input.
  - Dropdown preview displaying thumbnails, title, rating, year, and primary genre.
  - Keyboard arrow navigation (`Up`/`Down`/`Enter`) and `Escape` to close.
- **Dedicated Search View (`/search?q=...`)**:
  - Grid view of results with `ShowCard`s and full hover preview support.
  - Filter results by genre.
  - Sort results by Rating (High to Low), Release Year (Newest), or Title (A–Z).
  - Friendly empty state and suggestion hints when no results match.

### 5. Watchlist System (`useWatchlist.js`)
- Bookmarking capability allowing users to save their favorite shows across sessions via `localStorage`.
- Live counter in header navigation.
- Dedicated `/watchlist` screen.

---

## 🏗 Architecture & Frontend Best Practices

- **Zero Heavy UI Scaffolding / Bloat**: Built purely with Vue 3 and custom scoped CSS. No heavy third-party UI framework dependencies (e.g., Vuetify, Element Plus) — everything is bespoke, performant, and lightweight.
- **Composition API & `<script setup>`**: Clean, reactive state management using Vue 3 composables (`useShows`, `useSearch`, `useWatchlist`, `useHoverPreview`).
- **Separation of Concerns**:
  - `src/services/tvmazeApi.js`: Centralized API client with in-memory caching for snappy, zero-redundancy page navigation.
  - `src/utils/formatters.js`: Pure functions for HTML stripping, rating formatting, year ranges, and runtime strings.
  - `src/components/common/`: Reusable primitives (`RatingBadge`, `LoadingSkeleton`, `ErrorState`).
  - `src/components/shows/`: Domain components (`ShowCard`, `GenreRow`, `HeroBanner`, `CastList`, `EpisodeList`, `ShowHoverPreview`).
  - `src/views/`: Router view containers (`DashboardView`, `ShowDetailView`, `SearchView`, `WatchlistView`).
- **Comprehensive Unit Testing**: Full suite of 32 unit tests using **Vitest** and **@vue/test-utils** covering formatters, services, state composables, and components.

---

## 📱 Responsive Design

- Fully responsive from mobile devices (320px+) to ultra-wide desktop monitors (1440px+).
- Touch-friendly horizontal scroll carousels with native inertial momentum.
- Collapsible mobile navigation menu with embedded search.
- Responsive poster grids that adapt card sizes per breakpoint (`grid-cards`).

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+) and npm.

### Quick Start
1. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Or double-click `run-dev.bat`.
   Open the displayed URL (usually `http://localhost:5173`) in your browser.

2. **Run Unit Tests**:
   ```bash
   npm run test
   ```
   Or double-click `run-test.bat`.

3. **Build for Production**:
   ```bash
   npm run build
   ```
   The optimized production bundle will be generated in `dist/`.
