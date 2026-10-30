# ShowCase — Discover Popular TV Shows & Genres

> A modern, responsive Vue 3 application built with clean frontend best practices, utilizing the open [TVMaze API](https://www.tvmaze.com/api). Features dynamic genre carousels, a vibrant streaming UI, rich hover detail popovers, instant search autocomplete, a dedicated genre browser, and watchlist bookmarking.

---

## 🌟 Key Features & Updates

### 1. Fix Overlapping Ranking and Rating
- **Top-Rated Cards Separation**:
  - The **Rank Badge** (`#1`, `#2`, `#3`, etc.) is placed at the **top-left** with a vibrant gradient pill.
  - The **Rating Badge** is placed cleanly at the **bottom-left** of the poster on ranked cards (and top-left on unranked cards).
  - The **Quick Watchlist Bookmark** is placed at the **top-right**.
  - **Zero visual overlap**, creating a balanced, clean presentation.

### 2. Modern, Attractive Cinema Streaming Color Palette
- Replaced the previous IMDb yellow theme with a premium streaming aesthetic:
  - **Background**: Deep space obsidian (`#08090e`, `#0f121d`, `#161928`) with ambient mesh gradients.
  - **Accents**: Electric Indigo, Radiant Violet, and Vivid Fuchsia (`linear-gradient(135deg, #6366f1, #8b5cf6, #d946ef)`).
  - **Stars & Ratings**: Warm glowing amber (`#fbbf24`) with glassmorphism backdrop tags.
  - **Glow & Elevation**: Modern neon-tinted hover glows, frosted glass cards, and crisp borders.

### 3. Global Genre Dropdown (Works on Watchlist & All Pages)
- **Universal Dropdown in Header (`Navbar.vue`)**:
  - A persistent **Genres ▾** dropdown menu accessible from **any screen** (Watchlist, Show Details, Search, Dashboard).
  - Selecting any genre immediately navigates to that genre's dedicated collection.
- **Dedicated Genre View (`src/views/GenreView.vue`)**:
  - Route: `/genre/:genre` (e.g., `/genre/Drama`, `/genre/Action`, `/genre/Top-Rated`, etc.).
  - Displays a full responsive grid of TV shows for that genre.
  - Includes a quick-switcher dropdown to toggle genres and sort options (by Highest Rating, Popularity, Release Year, Title A–Z).

### 4. "View All" Component for Every Genre Row
- In **`GenreRow.vue`**, each horizontal row on the front page now includes a dedicated **"View All →"** component button.
- Clicking "View All" redirects the user to the full genre catalog page (`/genre/:genre`) displaying all shows in that category with sorting and count indicators.

### 5. Application Rebranding to "ShowCase"
- Updated application branding from CineMaze to **ShowCase** across the logo, navbar, footer, HTML title, document titles, routes, and documentation.

---

## 🏗 Architecture & Code Quality

- **Vue 3 + Composition API (`<script setup>`)**: Lightweight, reusable, clean code without unnecessary boilerplate.
- **Separation of Concerns**:
  - `src/services/tvmazeApi.js`: Centralized API service with in-memory caching.
  - `src/utils/formatters.js`: Pure functions for HTML stripping, rating formatting, year ranges, and runtime strings.
  - `src/composables/`: Reusable state logic (`useShows`, `useSearch`, `useHoverPreview`, `useWatchlist`).
  - `src/components/shows/`: `ShowCard`, `GenreRow`, `HeroBanner`, `CastList`, `EpisodeList`, `ShowHoverPreview`.
  - `src/views/`: `DashboardView`, `ShowDetailView`, `GenreView`, `SearchView`, `WatchlistView`.
- **Vitest Unit Test Suite**: 34 unit tests covering components, composables, formatters, and API services.

---

## 🚀 How to Run

1. **Development Server**:
   ```bash
   npm run dev
   ```
   *(Or double-click `run-dev.bat`)*.

2. **Run Unit Tests**:
   ```bash
   npm run test
   ```
   *(Or double-click `run-test.bat`)*.

3. **Production Build**:
   ```bash
   npm run build
   ```
