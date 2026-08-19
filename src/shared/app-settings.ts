export const THEME_OPTIONS = ['light', 'dark', 'system'] as const
export type ThemePreference = (typeof THEME_OPTIONS)[number]

export const UPDATE_INSTALL_MODES = ['immediate', 'onQuit', 'scheduled'] as const
export type UpdateInstallMode = (typeof UPDATE_INSTALL_MODES)[number]

export const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD MMM YYYY'] as const
export type DateFormat = (typeof DATE_FORMATS)[number]

export const TIME_FORMATS = ['12h', '24h'] as const
export type TimeFormat = (typeof TIME_FORMATS)[number]

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'af', label: 'Afrikaans' },
  { value: 'zu', label: 'Zulu' },
  { value: 'xh', label: 'Xhosa' },
  { value: 'st', label: 'Sotho' },
  { value: 'tn', label: 'Tswana' },
  { value: 'ts', label: 'Tsonga' },
  { value: 'ss', label: 'Swati' },
  { value: 've', label: 'Venda' },
  { value: 'nr', label: 'Ndebele' },
  { value: 'nso', label: 'Pedi' },
  { value: 'pt', label: 'Portuguese' }
] as const

export type LanguageCode = (typeof LANGUAGE_OPTIONS)[number]['value']

export const TIMEZONE_OPTIONS = [
  { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (SAST)' },
  { value: 'Africa/Maputo', label: 'Africa/Maputo' },
  { value: 'Africa/Harare', label: 'Africa/Harare' },
  { value: 'Africa/Windhoek', label: 'Africa/Windhoek' },
  { value: 'Africa/Gaborone', label: 'Africa/Gaborone' },
  { value: 'Africa/Maseru', label: 'Africa/Maseru' },
  { value: 'Africa/Mbabane', label: 'Africa/Mbabane' },
  { value: 'UTC', label: 'UTC' }
] as const

export const UPDATE_INSTALL_MODE_OPTIONS = [
  { value: 'immediate', label: 'Immediately' },
  { value: 'onQuit', label: 'On quit' },
  { value: 'scheduled', label: 'Scheduled time' }
] as const

export const THEME_LABELS: Record<ThemePreference, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System'
}

export interface AppSettings {
  language: LanguageCode
  theme: ThemePreference
  openAtLogin: boolean
  launchMinimized: boolean
  autoCheckUpdates: boolean
  autoInstallUpdates: boolean
  updateInstallMode: UpdateInstallMode
  updateInstallTime: string
  dateFormat: DateFormat
  timeFormat: TimeFormat
  timezone: string
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  language: 'en',
  theme: 'system',
  openAtLogin: false,
  launchMinimized: false,
  autoCheckUpdates: true,
  autoInstallUpdates: false,
  updateInstallMode: 'onQuit',
  updateInstallTime: '02:00',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  timezone: 'Africa/Johannesburg'
}

export type UpdateStatusKind =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'ready'
  | 'error'
  | 'unsupported'

export interface UpdateStatus {
  kind: UpdateStatusKind
  message: string
  version?: string
  progress?: number
}

export interface AppSettingsMeta {
  name: string
  version: string
  platform: string
  packaged: boolean
  url: string
  appId: string
}

export interface DesktopApi {
  getSettings: () => Promise<AppSettings>
  setSettings: (patch: Partial<AppSettings>) => Promise<AppSettings>
  getMeta: () => Promise<AppSettingsMeta>
  checkForUpdates: () => Promise<UpdateStatus>
  installUpdate: () => Promise<UpdateStatus>
  getUpdateStatus: () => Promise<UpdateStatus>
  onUpdateStatus: (listener: (status: UpdateStatus) => void) => () => void
  onSettingsChanged: (listener: (settings: AppSettings) => void) => () => void
}

export const SETTINGS_IPC = {
  get: 'settings:get',
  set: 'settings:set',
  getMeta: 'settings:get-meta',
  changed: 'settings:changed'
} as const

export const UPDATER_IPC = {
  check: 'updater:check',
  install: 'updater:install',
  getStatus: 'updater:get-status',
  statusEvent: 'updater:status'
} as const

const LANGUAGE_VALUES = LANGUAGE_OPTIONS.map((option) => option.value)
const TIMEZONE_VALUES = TIMEZONE_OPTIONS.map((option) => option.value)

/**
 * True when `value` is one of the supported theme preferences.
 */
export function isThemePreference(value: unknown): value is ThemePreference {
  return THEME_OPTIONS.some((option) => option === value)
}

/**
 * True when `value` is a supported display language code.
 */
export function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === 'string' && LANGUAGE_VALUES.includes(value as LanguageCode)
}

/**
 * True when `value` is a supported update install mode.
 */
export function isUpdateInstallMode(value: unknown): value is UpdateInstallMode {
  return UPDATE_INSTALL_MODES.some((option) => option === value)
}

/**
 * True when `value` is a supported date format.
 */
export function isDateFormat(value: unknown): value is DateFormat {
  return DATE_FORMATS.some((option) => option === value)
}

/**
 * True when `value` is a supported time format.
 */
export function isTimeFormat(value: unknown): value is TimeFormat {
  return TIME_FORMATS.some((option) => option === value)
}

/**
 * True when `value` is `HH:mm` in 24-hour clock.
 */
export function isInstallTime(value: unknown): value is string {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
}

/**
 * True when `value` is a supported timezone id.
 */
export function isTimezone(value: unknown): value is string {
  return typeof value === 'string' && TIMEZONE_VALUES.some((option) => option === value)
}

/**
 * Merge a partial settings object onto defaults and drop invalid fields.
 */
export function sanitizeSettings(input: Partial<AppSettings> | null | undefined): AppSettings {
  const next: AppSettings = { ...DEFAULT_APP_SETTINGS, ...(input ?? {}) }

  if (!isLanguageCode(next.language)) next.language = DEFAULT_APP_SETTINGS.language
  if (!isThemePreference(next.theme)) next.theme = DEFAULT_APP_SETTINGS.theme
  if (typeof next.openAtLogin !== 'boolean') next.openAtLogin = DEFAULT_APP_SETTINGS.openAtLogin
  if (typeof next.launchMinimized !== 'boolean') {
    next.launchMinimized = DEFAULT_APP_SETTINGS.launchMinimized
  }
  if (typeof next.autoCheckUpdates !== 'boolean') {
    next.autoCheckUpdates = DEFAULT_APP_SETTINGS.autoCheckUpdates
  }
  if (typeof next.autoInstallUpdates !== 'boolean') {
    next.autoInstallUpdates = DEFAULT_APP_SETTINGS.autoInstallUpdates
  }
  if (!isUpdateInstallMode(next.updateInstallMode)) {
    next.updateInstallMode = DEFAULT_APP_SETTINGS.updateInstallMode
  }
  if (!isInstallTime(next.updateInstallTime)) {
    next.updateInstallTime = DEFAULT_APP_SETTINGS.updateInstallTime
  }
  if (!isDateFormat(next.dateFormat)) next.dateFormat = DEFAULT_APP_SETTINGS.dateFormat
  if (!isTimeFormat(next.timeFormat)) next.timeFormat = DEFAULT_APP_SETTINGS.timeFormat
  if (!isTimezone(next.timezone)) next.timezone = DEFAULT_APP_SETTINGS.timezone

  return next
}
