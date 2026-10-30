import { describe, it, expect } from 'vitest'
import {
  stripHtml,
  formatRating,
  formatYearRange,
  formatRuntime,
  formatSchedule,
  getImageUrl
} from '../../src/utils/formatters.js'

describe('formatters utility functions', () => {
  describe('stripHtml', () => {
    it('should strip simple HTML tags', () => {
      const input = '<p>A <b>great</b> television series.</p>'
      expect(stripHtml(input)).toBe('A great television series.')
    })

    it('should unescape standard HTML entities', () => {
      const input = '<p>Rock &amp; Roll &#039;classic&#039; &quot;show&quot; &lt;special&gt;</p>'
      expect(stripHtml(input)).toBe("Rock & Roll 'classic' \"show\" <special>")
    })

    it('should truncate at word boundary when maxLength is specified', () => {
      const input = '<p>The quick brown fox jumps over the lazy dog and runs away.</p>'
      const truncated = stripHtml(input, 30)
      expect(truncated.endsWith('...')).toBe(true)
      expect(truncated.length).toBeLessThanOrEqual(35)
      expect(truncated).toBe('The quick brown fox jumps...')
    })

    it('should return fallback message when string is empty or null', () => {
      expect(stripHtml(null)).toBe('No synopsis available.')
      expect(stripHtml('')).toBe('No synopsis available.')
    })
  })

  describe('formatRating', () => {
    it('should format number to one decimal place', () => {
      expect(formatRating(8.54)).toBe('8.5')
      expect(formatRating(9)).toBe('9.0')
    })

    it('should accept object with average property', () => {
      expect(formatRating({ average: 8.8 })).toBe('8.8')
    })

    it('should return dash for null, undefined, or missing rating', () => {
      expect(formatRating(null)).toBe('—')
      expect(formatRating({ average: null })).toBe('—')
      expect(formatRating(undefined)).toBe('—')
    })
  })

  describe('formatYearRange', () => {
    it('should format completed shows with start and end years', () => {
      expect(formatYearRange('2008-01-20', '2013-09-29')).toBe('2008–2013')
    })

    it('should format ongoing shows with trailing dash', () => {
      expect(formatYearRange('2022-08-21', null)).toBe('2022–')
    })

    it('should show single year if premiered and ended in the same year', () => {
      expect(formatYearRange('2021-01-15', '2021-03-05')).toBe('2021')
    })

    it('should handle missing premiered date', () => {
      expect(formatYearRange(null, null)).toBe('—')
    })
  })

  describe('formatRuntime', () => {
    it('should format minutes under an hour', () => {
      expect(formatRuntime(45)).toBe('45m')
    })

    it('should format exact hours', () => {
      expect(formatRuntime(60)).toBe('1h')
      expect(formatRuntime(120)).toBe('2h')
    })

    it('should format hours and minutes combined', () => {
      expect(formatRuntime(75)).toBe('1h 15m')
    })

    it('should handle null or zero runtime', () => {
      expect(formatRuntime(0)).toBe('')
      expect(formatRuntime(null)).toBe('')
    })
  })

  describe('formatSchedule', () => {
    it('should format days and time', () => {
      const schedule = { days: ['Monday'], time: '21:00' }
      expect(formatSchedule(schedule)).toBe('Monday at 21:00')
    })

    it('should handle multiple days', () => {
      const schedule = { days: ['Monday', 'Tuesday'], time: '20:00' }
      expect(formatSchedule(schedule)).toBe('Monday, Tuesday at 20:00')
    })

    it('should return empty string when empty', () => {
      expect(formatSchedule({ days: [], time: '' })).toBe('')
      expect(formatSchedule(null)).toBe('')
    })
  })

  describe('getImageUrl', () => {
    it('should return requested size when available', () => {
      const image = { medium: 'http://example.com/med.jpg', original: 'http://example.com/orig.jpg' }
      expect(getImageUrl(image, 'original')).toBe('http://example.com/orig.jpg')
      expect(getImageUrl(image, 'medium')).toBe('http://example.com/med.jpg')
    })

    it('should fall back to other size if requested size is missing', () => {
      const image = { original: 'http://example.com/orig.jpg' }
      expect(getImageUrl(image, 'medium')).toBe('http://example.com/orig.jpg')
    })

    it('should return null if image is null or undefined', () => {
      expect(getImageUrl(null)).toBeNull()
    })
  })
})
