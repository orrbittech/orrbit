import type { DateFormat, TimeFormat } from './app-settings'

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
] as const

/**
 * Calendar parts for `date` in `timeZone`, using the Gregorian calendar.
 */
function zonedParts(date: Date, timeZone: string): {
  year: number
  month: number
  day: number
  hour: number
  minute: number
} {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date)

  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const value = parts.find((part) => part.type === type)?.value
    return value ? Number(value) : 0
  }

  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    hour: read('hour'),
    minute: read('minute')
  }
}

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

/**
 * Format a date using the user's regional settings. Applied as soon as those
 * settings change so lists and previews update without a restart.
 */
export function formatDateWithSettings(
  date: Date,
  dateFormat: DateFormat,
  timeZone: string
): string {
  const { year, month, day } = zonedParts(date, timeZone)
  const yyyy = String(year)
  const mm = pad2(month)
  const dd = pad2(day)
  const monthName = SHORT_MONTHS[month - 1] ?? mm

  switch (dateFormat) {
    case 'DD/MM/YYYY':
      return `${dd}/${mm}/${yyyy}`
    case 'MM/DD/YYYY':
      return `${mm}/${dd}/${yyyy}`
    case 'YYYY-MM-DD':
      return `${yyyy}-${mm}-${dd}`
    case 'DD MMM YYYY':
      return `${dd} ${monthName} ${yyyy}`
    default: {
      const exhaustive: never = dateFormat
      return exhaustive
    }
  }
}

/**
 * Format a time using the user's 12/24-hour preference in `timeZone`.
 */
export function formatTimeWithSettings(
  date: Date,
  timeFormat: TimeFormat,
  timeZone: string
): string {
  const { hour, minute } = zonedParts(date, timeZone)
  const mm = pad2(minute)

  switch (timeFormat) {
    case '24h':
      return `${pad2(hour)}:${mm}`
    case '12h': {
      const suffix = hour >= 12 ? 'PM' : 'AM'
      const hour12 = hour % 12 === 0 ? 12 : hour % 12
      return `${hour12}:${mm} ${suffix}`
    }
    default: {
      const exhaustive: never = timeFormat
      return exhaustive
    }
  }
}

/**
 * Combined date + time preview for the current regional settings.
 */
export function formatDateTimeWithSettings(
  date: Date,
  dateFormat: DateFormat,
  timeFormat: TimeFormat,
  timeZone: string
): string {
  return `${formatDateWithSettings(date, dateFormat, timeZone)} ${formatTimeWithSettings(date, timeFormat, timeZone)}`
}
