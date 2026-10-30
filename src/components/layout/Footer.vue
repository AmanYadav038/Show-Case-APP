<template>
  <footer class="app-footer">
    <div class="footer-inner container">
      <div class="footer-top">
        <div class="footer-brand">
          <div class="logo">
            <div class="logo-icon-wrap">
              <svg class="logo-play-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 3.75C4 2.784 5.048 2.181 5.882 2.667L20.132 10.917C20.963 11.399 20.963 12.601 20.132 13.083L5.882 21.333C5.048 21.819 4 21.216 4 20.25V3.75Z" />
              </svg>
            </div>
            <span class="logo-text">Show<span class="text-gradient">Case</span></span>
          </div>
          <p class="brand-desc">
            Your premier destination for exploring popular television series, ratings, and genre collections. Powered by the open TVMaze API.
          </p>
        </div>

        <div class="footer-links-group">
          <h4 class="links-title">Features</h4>
          <ul class="links-list">
            <li><router-link to="/">Dashboard</router-link></li>
            <li><router-link to="/genre/Drama">Browse Genres</router-link></li>
            <li><router-link to="/search">Search TV Shows</router-link></li>
            <li><router-link to="/watchlist">My Watchlist</router-link></li>
          </ul>
        </div>

        <div class="footer-links-group">
          <h4 class="links-title">Data Source</h4>
          <ul class="links-list">
            <li><a href="https://www.tvmaze.com/api" target="_blank" rel="noopener noreferrer">TVMaze API</a></li>
            <li><a href="https://www.tvmaze.com" target="_blank" rel="noopener noreferrer">TVMaze.com</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="copyright">
          © {{ new Date().getFullYear() }} ShowCase. Built with Vue 3 & Clean Frontend Architecture.
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: #08090e;
  border-top: 1px solid var(--border-subtle);
  padding: 3.5rem 0 2rem;
  margin-top: 4rem;
}

.footer-top {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
  margin-bottom: 2.5rem;
}

@media (min-width: 768px) {
  .footer-top {
    grid-template-columns: 2fr 1fr 1fr;
  }
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-weight: 800;
  font-size: 1.35rem;
  margin-bottom: 0.85rem;
}

.logo-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-play-icon {
  width: 14px;
  height: 14px;
  color: #fff;
  margin-left: 2px;
}

.text-gradient {
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-desc {
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 1.6;
  max-width: 360px;
}

.links-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.links-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.links-list a {
  font-size: 0.86rem;
  color: var(--text-secondary);
  transition: color var(--transition-fast);
}

.links-list a:hover {
  color: #fff;
}

.footer-bottom {
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.copyright {
  font-size: 0.82rem;
  color: var(--text-muted);
}
</style>
