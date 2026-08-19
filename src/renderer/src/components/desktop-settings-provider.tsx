import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'
import { useTheme } from 'next-themes'
import {
  DEFAULT_APP_SETTINGS,
  isThemePreference,
  sanitizeSettings,
  type AppSettings,
  type AppSettingsMeta,
  type UpdateStatus
} from '@shared/app-settings'
import { APP_NAME, APP_URL, APP_VERSION } from '@shared/product'
import {
  formatDateTimeWithSettings,
  formatDateWithSettings,
  formatTimeWithSettings
} from '@shared/format-datetime'

/**
 * Apply the persisted display language to the document immediately.
 * @param language BCP 47 / APK language code.
 */
export function applyDocumentLanguage(language: string): void {
  document.documentElement.lang = language
}

interface DesktopSettingsContextValue {
  settings: AppSettings
  meta: AppSettingsMeta | null
  updateStatus: UpdateStatus
  isLoading: boolean
  hasError: boolean
  patch: (partial: Partial<AppSettings>) => Promise<AppSettings>
  checkForUpdates: () => Promise<void>
  installUpdate: () => Promise<void>
  formatDate: (date: Date) => string
  formatTime: (date: Date) => string
  formatDateTime: (date: Date) => string
}

const DesktopSettingsContext = createContext<DesktopSettingsContextValue | null>(null)

const FALLBACK_META: AppSettingsMeta = {
  name: APP_NAME,
  version: APP_VERSION,
  platform: '',
  packaged: false,
  url: APP_URL,
  appId: ''
}

/**
 * Load desktop settings once, apply them as they change, and share them app-wide.
 */
export function DesktopSettingsProvider({ children }: { children: ReactNode }) {
  const { setTheme } = useTheme()
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_APP_SETTINGS)
  const [meta, setMeta] = useState<AppSettingsMeta | null>(null)
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({
    kind: 'idle',
    message: 'No update check yet.'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const applyLocally = useCallback(
    (next: AppSettings, patch?: Partial<AppSettings>) => {
      setSettingsState(next)
      applyDocumentLanguage(next.language)
      if (!patch || patch.theme) {
        if (isThemePreference(next.theme)) setTheme(next.theme)
      }
    },
    [setTheme]
  )

  useEffect(() => {
    let cancelled = false
    const api = window.api

    if (!api) {
      setIsLoading(false)
      setHasError(true)
      document.title = APP_NAME
      return
    }

    async function load(): Promise<void> {
      try {
        const [next, nextMeta, status] = await Promise.all([
          api.getSettings(),
          api.getMeta(),
          api.getUpdateStatus()
        ])
        if (cancelled) return
        applyLocally(next)
        setMeta(nextMeta)
        setUpdateStatus(status)
        document.title = nextMeta.name || APP_NAME
      } catch {
        if (!cancelled) {
          setHasError(true)
          document.title = APP_NAME
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    const unsubscribeStatus = api.onUpdateStatus((status) => {
      setUpdateStatus(status)
    })
    const unsubscribeSettings = api.onSettingsChanged((next) => {
      applyLocally(next)
    })

    return () => {
      cancelled = true
      unsubscribeStatus()
      unsubscribeSettings()
    }
  }, [applyLocally])

  const patch = useCallback(
    async (partial: Partial<AppSettings>): Promise<AppSettings> => {
      const optimistic = sanitizeSettings({ ...settings, ...partial })
      applyLocally(optimistic, partial)
      try {
        const next = await window.api.setSettings(partial)
        applyLocally(next)
        return next
      } catch (error) {
        try {
          const current = await window.api.getSettings()
          applyLocally(current)
        } catch {
          setHasError(true)
        }
        throw error
      }
    },
    [applyLocally, settings]
  )

  const checkForUpdates = useCallback(async (): Promise<void> => {
    const status = await window.api.checkForUpdates()
    setUpdateStatus(status)
  }, [])

  const installUpdate = useCallback(async (): Promise<void> => {
    const status = await window.api.installUpdate()
    setUpdateStatus(status)
  }, [])

  const formatDate = useCallback(
    (date: Date) => formatDateWithSettings(date, settings.dateFormat, settings.timezone),
    [settings.dateFormat, settings.timezone]
  )

  const formatTime = useCallback(
    (date: Date) => formatTimeWithSettings(date, settings.timeFormat, settings.timezone),
    [settings.timeFormat, settings.timezone]
  )

  const formatDateTime = useCallback(
    (date: Date) =>
      formatDateTimeWithSettings(
        date,
        settings.dateFormat,
        settings.timeFormat,
        settings.timezone
      ),
    [settings.dateFormat, settings.timeFormat, settings.timezone]
  )

  const value = useMemo<DesktopSettingsContextValue>(
    () => ({
      settings,
      meta: meta ?? FALLBACK_META,
      updateStatus,
      isLoading,
      hasError,
      patch,
      checkForUpdates,
      installUpdate,
      formatDate,
      formatTime,
      formatDateTime
    }),
    [
      settings,
      meta,
      updateStatus,
      isLoading,
      hasError,
      patch,
      checkForUpdates,
      installUpdate,
      formatDate,
      formatTime,
      formatDateTime
    ]
  )

  return (
    <DesktopSettingsContext.Provider value={value}>{children}</DesktopSettingsContext.Provider>
  )
}

/**
 * Desktop settings store: persist via IPC and apply theme/language/regional formatting live.
 */
export function useDesktopSettings(): DesktopSettingsContextValue {
  const context = useContext(DesktopSettingsContext)
  if (!context) {
    throw new Error('useDesktopSettings must be used within DesktopSettingsProvider')
  }
  return context
}
