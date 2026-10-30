<template>
  <footer class="app-footer">
    <div class="footer-inner container">
      <div class="footer-top">
        <div class="footer-brand">
          <div class="logo">
            <span class="logo-box">CM</span>
            <span class="logo-text">Cine<span class="text-gold">Maze</span></span>
          </div>
          <p class="brand-desc">
            Your destination for discovering popular TV shows, ratings, and genre collections. Powered by the open TVMaze API.
          </p>
        </div>

        <div class="footer-links-group">
          <h4 class="links-title">Features</h4>
          <ul class="links-list">
            <li><router-link to="/">Dashboard</router-link></li>
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
          © {{ new Date().getFullYear() }} CineMaze. Built with Vue 3 & Clean Frontend Architecture.
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: #090a0d;
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
  gap: 0.6rem;
  font-weight: 800;
  font-size: 1.25rem;
  margin-bottom: 0.85rem;
}

.logo-box {
  background: var(--accent-gold);
  color: #000;
  font-weight: 900;
  font-size: 0.8rem;
  padding: 0.18rem 0.4rem;
  border-radius: var(--radius-sm);
}

.text-gold {
  color: var(--accent-gold);
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
  color: var(--accent-gold);
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
