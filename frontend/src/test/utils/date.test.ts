import { describe, expect, it, vi } from 'vitest'
import { timeAgo } from '@/utils/date'

describe('timeAgo', () => {
  // Mock the current time to make tests deterministic
  const fixedNow = new Date('2025-10-15T12:00:00Z')
  vi.setSystemTime(fixedNow)

  it("returns 'just now' for dates less than a minute ago", () => {
    const d = new Date(fixedNow.getTime() - 30 * 1000).toISOString()
    expect(timeAgo(d)).toBe('just now')
  })

  it("returns '1 minute ago' for about one minute difference", () => {
    const d = new Date(fixedNow.getTime() - 60 * 1000).toISOString()
    expect(timeAgo(d)).toBe('1 minute ago')
  })

  it("returns '5 minutes ago' for five minutes difference", () => {
    const d = new Date(fixedNow.getTime() - 5 * 60 * 1000).toISOString()
    expect(timeAgo(d)).toBe('5 minutes ago')
  })

  it("returns '2 hours ago' for two hours difference", () => {
    const d = new Date(fixedNow.getTime() - 2 * 3600 * 1000).toISOString()
    expect(timeAgo(d)).toBe('2 hours ago')
  })

  it("returns '1 day ago' for one day difference", () => {
    const d = new Date(fixedNow.getTime() - 24 * 3600 * 1000).toISOString()
    expect(timeAgo(d)).toBe('1 day ago')
  })

  it("returns '3 days ago' for three days difference", () => {
    const d = new Date(fixedNow.getTime() - 3 * 24 * 3600 * 1000).toISOString()
    expect(timeAgo(d)).toBe('3 days ago')
  })

  it("returns '2 months ago' for about two months difference", () => {
    const d = new Date(fixedNow.getTime() - 60 * 24 * 3600 * 1000).toISOString()
    expect(timeAgo(d)).toBe('2 months ago')
  })

  it("returns '1 year ago' for about one year difference", () => {
    const d = new Date(
      fixedNow.getTime() - 365 * 24 * 3600 * 1000,
    ).toISOString()
    expect(timeAgo(d)).toBe('1 year ago')
  })

  it("handles timestamps without 'Z' (local time)", () => {
    const localDate = '2025-10-15T11:00:00' // one hour before fixedNow (local)
    expect(timeAgo(localDate)).toBe('1 hour ago')
  })
})
