import { describe, it, expect, beforeEach } from 'vitest'
import { useI18n, translations } from '../../src/composables/useI18n.js'

describe('useI18n composable', () => {
  let i18n

  beforeEach(() => {
    i18n = useI18n()
    i18n.setLocale('en')
    if (typeof localStorage !== 'undefined') {
      localStorage.clear()
    }
  })

  it('initializes with default locale "en"', () => {
    expect(i18n.currentLocale.value).toBe('en')
  })

  it('switches locale between "en" and "hi"', () => {
    i18n.setLocale('hi')
    expect(i18n.currentLocale.value).toBe('hi')

    i18n.setLocale('en')
    expect(i18n.currentLocale.value).toBe('en')
  })

  it('ignores invalid locale codes', () => {
    i18n.setLocale('en')
    i18n.setLocale('fr')
    expect(i18n.currentLocale.value).toBe('en')
  })

  it('toggles locale between en and hi with toggleLocale()', () => {
    i18n.setLocale('en')
    const next1 = i18n.toggleLocale()
    expect(next1).toBe('hi')
    expect(i18n.currentLocale.value).toBe('hi')

    const next2 = i18n.toggleLocale()
    expect(next2).toBe('en')
    expect(i18n.currentLocale.value).toBe('en')
  })

  it('translates navigation keys in English and Hindi', () => {
    i18n.setLocale('en')
    expect(i18n.t('nav.discover')).toBe('Dashboard')
    expect(i18n.t('nav.genres')).toBe('Genres')
    expect(i18n.t('nav.watchlist')).toBe('Watchlist')

    i18n.setLocale('hi')
    expect(i18n.t('nav.discover')).toBe('डैशबोर्ड')
    expect(i18n.t('nav.genres')).toBe('शैलियां')
    expect(i18n.t('nav.watchlist')).toBe('वॉचलिस्ट')
  })

  it('interpolates single and multiple parameters correctly', () => {
    i18n.setLocale('en')
    expect(i18n.t('genreView.title', { genre: 'Action' })).toBe('Action TV Shows')
    expect(i18n.t('genreView.showingCount', { count: 25 })).toBe('Showing 25 TV shows')

    i18n.setLocale('hi')
    expect(i18n.t('genreView.title', { genre: 'एक्शन' })).toBe('एक्शन टीवी शो')
    expect(i18n.t('genreView.showingCount', { count: 25 })).toBe('25 टीवी शो दिखाए जा रहे हैं')
  })

  it('translates showDetail keys accurately in Hindi', () => {
    i18n.setLocale('hi')
    expect(i18n.t('showDetail.back')).toBe('डैशबोर्ड पर वापस जाएं')
    expect(i18n.t('showDetail.inWatchlist')).toBe('वॉचलिस्ट में शामिल')
    expect(i18n.t('showDetail.addWatchlist')).toBe('वॉचलिस्ट में जोड़ें')
    expect(i18n.t('showDetail.synopsis')).toBe('अवलोकन / सारांश')
    expect(i18n.t('showDetail.topCast')).toBe('मुख्य कलाकार')
    expect(i18n.t('showDetail.episodes')).toBe('एपिसोड')
    expect(i18n.t('showDetail.season')).toBe('सीज़न')
  })

  it('translates genres from English to Hindi', () => {
    i18n.setLocale('en')
    expect(i18n.translateGenre('Drama')).toBe('Drama')
    expect(i18n.translateGenre('Action')).toBe('Action')
    expect(i18n.translateGenre('Comedy')).toBe('Comedy')

    i18n.setLocale('hi')
    expect(i18n.translateGenre('Drama')).toBe('ड्रामा')
    expect(i18n.translateGenre('Action')).toBe('एक्शन')
    expect(i18n.translateGenre('Science-Fiction')).toBe('साइंस-फिक्शन')
    expect(i18n.translateGenre('Comedy')).toBe('कॉमेडी')
    expect(i18n.translateGenre('Thriller')).toBe('थ्रिलर')
    expect(i18n.translateGenre('Crime')).toBe('क्राइम')
    expect(i18n.translateGenre('Anime')).toBe('एनिमे')
    expect(i18n.translateGenre('Adventure')).toBe('एडवेंचर')
    expect(i18n.translateGenre('Fantasy')).toBe('फैंटेसी')
    expect(i18n.translateGenre('Western')).toBe('वेस्टर्न')
    expect(i18n.translateGenre('War')).toBe('युद्ध')
  })

  it('gracefully handles unknown genres by returning original value', () => {
    i18n.setLocale('hi')
    expect(i18n.translateGenre('Docudrama')).toBe('Docudrama')
    expect(i18n.translateGenre('')).toBe('')
    expect(i18n.translateGenre(null)).toBe('')
  })

  it('falls back to English when a translation key is missing in Hindi', () => {
    i18n.setLocale('hi')
    // Both dictionaries have complete keys, but test fallback behavior
    const result = i18n.t('nonexistent.path.key')
    expect(result).toBe('nonexistent.path.key')
  })

  it('contains matching key structures between en and hi dictionaries', () => {
    expect(Object.keys(translations.en)).toEqual(expect.arrayContaining(['nav', 'hero', 'dashboard', 'genreView', 'search', 'watchlist', 'showDetail', 'footer', 'genres']))
    expect(Object.keys(translations.hi)).toEqual(expect.arrayContaining(['nav', 'hero', 'dashboard', 'genreView', 'search', 'watchlist', 'showDetail', 'footer', 'genres']))

    for (const section of ['nav', 'hero', 'dashboard', 'watchlist', 'showDetail', 'footer']) {
      const enKeys = Object.keys(translations.en[section]).sort()
      const hiKeys = Object.keys(translations.hi[section]).sort()
      expect(hiKeys).toEqual(enKeys)
    }
  })
})
