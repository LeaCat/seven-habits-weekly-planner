/**
 * useWeekKey.js
 * ISO week key helpers. Week starts on Sunday (index 0).
 *
 * ISO week string format: "YYYY-Www"  e.g. "2026-W46"
 *
 * NOTE: The ISO 8601 week officially starts on Monday, but this app
 * defines its week starting on Sunday to match Date.getDay() === 0.
 * We therefore compute week numbers using a Sunday-anchored epoch.
 */

/**
 * Return the ISO-style week key for the Sunday-anchored week containing `date`.
 * @param {Date} date
 * @returns {string} e.g. "2026-W46"
 */
function weekKeyFromDate(date) {
  // Shift to the Sunday of this week
  const sunday = new Date(date)
  sunday.setHours(0, 0, 0, 0)
  sunday.setDate(sunday.getDate() - sunday.getDay()) // back to Sunday

  // Use ISO year/week of that Sunday's Thursday (standard trick) but
  // we want our own Sunday-anchored week number, so we calculate directly.
  const year = sunday.getFullYear()
  // Day-of-year for this Sunday
  const startOfYear = new Date(year, 0, 1)
  // Find the first Sunday of the year
  const firstSunday = new Date(startOfYear)
  firstSunday.setDate(firstSunday.getDate() - firstSunday.getDay())
  // If first Sunday is in prior year, advance one week
  const baseYear = firstSunday.getFullYear() < year
    ? (() => { firstSunday.setDate(firstSunday.getDate() + 7); return year })()
    : year

  const diffMs = sunday - firstSunday
  const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000))

  // If sunday is before the first Sunday of 'year', it belongs to prev year's last week
  if (diffWeeks < 0) {
    return weekKeyFromDate(new Date(year - 1, 11, 31))
  }

  const weekNum = diffWeeks + 1
  const w = String(weekNum).padStart(2, '0')
  return `${baseYear}-W${w}`
}

/**
 * Return the week key for the current week (today).
 * @returns {string}
 */
export function currentWeekKey() {
  return weekKeyFromDate(new Date())
}

/**
 * Given a week key, return the week key for the previous week.
 * @param {string} k  e.g. "2026-W46"
 * @returns {string}
 */
export function prevWeekKey(k) {
  const sunday = sundayOfWeekKey(k)
  const prev = new Date(sunday)
  prev.setDate(prev.getDate() - 7)
  return weekKeyFromDate(prev)
}

/**
 * Given a week key, return a human-readable label.
 * e.g. "Nov 9 – Nov 15, 2026"
 * @param {string} k
 * @returns {string}
 */
export function weekLabel(k) {
  const dates = getWeekDates(k)
  const sunday = dates[0]
  const saturday = dates[6]
  const fmt = (d) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const year = saturday.getFullYear()
  return `${fmt(sunday)} – ${fmt(saturday)}, ${year}`
}

/**
 * Given a week key, return 7 Date objects for that week.
 * Index 0 = Sunday, index 6 = Saturday.
 * @param {string} k  e.g. "2026-W46"
 * @returns {Date[]}
 */
export function getWeekDates(k) {
  const sunday = sundayOfWeekKey(k)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday)
    d.setDate(d.getDate() + i)
    return d
  })
}

// ── Internal helper ──────────────────────────────────────────────────────────

/**
 * Parse a week key and return a Date set to midnight on the Sunday of that week.
 * @param {string} k  "YYYY-Www"
 * @returns {Date}
 */
function sundayOfWeekKey(k) {
  const [yearStr, weekPart] = k.split('-W')
  const year = parseInt(yearStr, 10)
  const weekNum = parseInt(weekPart, 10)

  // Find the first Sunday of that year
  const firstSunday = new Date(year, 0, 1)
  firstSunday.setHours(0, 0, 0, 0)
  firstSunday.setDate(firstSunday.getDate() - firstSunday.getDay())
  if (firstSunday.getFullYear() < year) {
    firstSunday.setDate(firstSunday.getDate() + 7)
  }

  // Advance by (weekNum - 1) weeks
  const sunday = new Date(firstSunday)
  sunday.setDate(sunday.getDate() + (weekNum - 1) * 7)
  return sunday
}
