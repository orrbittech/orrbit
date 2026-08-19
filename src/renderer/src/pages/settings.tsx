import { useEffect, useState, type ReactNode } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useDesktopSettings } from '@/hooks/use-desktop-settings'
import { APP_NAME, displayAppUrl } from '@/lib/product'
import {
  DATE_FORMATS,
  LANGUAGE_OPTIONS,
  THEME_LABELS,
  THEME_OPTIONS,
  TIME_FORMATS,
  TIMEZONE_OPTIONS,
  UPDATE_INSTALL_MODE_OPTIONS,
  isThemePreference,
  type ThemePreference
} from '@shared/app-settings'

/** Grouped settings card with a section heading. */
function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{title}</h2>
      <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5">{children}</div>
    </section>
  )
}

/** One settings control with title, description, and trailing widget. */
function SettingsRow({
  title,
  description,
  htmlFor,
  children
}: {
  title: string
  description: string
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
          {title}
        </Label>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0 sm:flex sm:justify-end">{children}</div>
    </div>
  )
}

/** Current clock that ticks so regional format changes are visible immediately. */
function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(new Date())
    }, intervalMs)
    return () => {
      window.clearInterval(id)
    }
  }, [intervalMs])
  return now
}

/** Signed-in Settings page for appearance, system, updates, regional, and about. */
export function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const {
    settings,
    meta,
    updateStatus,
    isLoading,
    hasError,
    patch,
    checkForUpdates,
    installUpdate,
    formatDateTime
  } = useDesktopSettings()
  const now = useNow()

  const themeValue = isThemePreference(theme) ? theme : settings.theme
  const controlsDisabled = isLoading || hasError
  const isChecking = updateStatus.kind === 'checking' || updateStatus.kind === 'downloading'
  const canInstall = updateStatus.kind === 'ready'
  const appName = meta?.name ?? APP_NAME
  const siteUrl = meta?.url ?? ''
  const siteLabel = displayAppUrl(siteUrl || undefined)

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background px-6 py-8 font-sans text-foreground">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Appearance, system, updates, and regional preferences for this app.
          </p>
        </header>

        {hasError ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Could not load settings from the desktop app.
          </p>
        ) : null}

        <SettingsSection title="Appearance">
          <SettingsRow title="Theme" description="Color scheme for the signed-in app.">
            <Select
              value={themeValue}
              disabled={controlsDisabled || !resolvedTheme}
              onValueChange={(value) => {
                const next = value as ThemePreference
                setTheme(next)
                void patch({ theme: next })
              }}
            >
              <SelectTrigger className="w-48" aria-label="Theme">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                {THEME_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {THEME_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingsRow>
          <Separator />
          <SettingsRow title="Language" description="Display language for this app.">
            <Select
              value={settings.language}
              disabled={controlsDisabled}
              onValueChange={(value) => {
                void patch({ language: value as typeof settings.language })
              }}
            >
              <SelectTrigger className="w-48" aria-label="Language">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title="System">
          <SettingsRow
            title="Open at login"
            description={`Start ${appName} when you sign in to this computer.`}
            htmlFor="open-at-login"
          >
            <Switch
              id="open-at-login"
              checked={settings.openAtLogin}
              disabled={controlsDisabled}
              onCheckedChange={(checked) => {
                void patch({ openAtLogin: checked })
              }}
            />
          </SettingsRow>
          <Separator />
          <SettingsRow
            title="Launch minimized"
            description="Keep the window minimized when opened at login."
            htmlFor="launch-minimized"
          >
            <Switch
              id="launch-minimized"
              checked={settings.launchMinimized}
              disabled={controlsDisabled}
              onCheckedChange={(checked) => {
                void patch({ launchMinimized: checked })
              }}
            />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title="Updates">
          <SettingsRow
            title="Automatically check for updates"
            description="Check on launch and once a day in packaged builds."
            htmlFor="auto-check-updates"
          >
            <Switch
              id="auto-check-updates"
              checked={settings.autoCheckUpdates}
              disabled={controlsDisabled}
              onCheckedChange={(checked) => {
                void patch({ autoCheckUpdates: checked })
              }}
            />
          </SettingsRow>
          <Separator />
          <SettingsRow
            title="Automatically download and install"
            description="Download updates in the background and apply them using the install timing below."
            htmlFor="auto-install-updates"
          >
            <Switch
              id="auto-install-updates"
              checked={settings.autoInstallUpdates}
              disabled={controlsDisabled}
              onCheckedChange={(checked) => {
                void patch({ autoInstallUpdates: checked })
              }}
            />
          </SettingsRow>
          <Separator />
          <SettingsRow title="Install when" description="When a downloaded update should be applied.">
            <Select
              value={settings.updateInstallMode}
              disabled={controlsDisabled || !settings.autoInstallUpdates}
              onValueChange={(value) => {
                void patch({
                  updateInstallMode: value as typeof settings.updateInstallMode
                })
              }}
            >
              <SelectTrigger className="w-48" aria-label="Install when">
                <SelectValue placeholder="Install when" />
              </SelectTrigger>
              <SelectContent>
                {UPDATE_INSTALL_MODE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingsRow>
          {settings.updateInstallMode === 'scheduled' ? (
            <>
              <Separator />
              <SettingsRow
                title="Update install time"
                description="Local time to apply a downloaded update."
                htmlFor="update-install-time"
              >
                <input
                  id="update-install-time"
                  type="time"
                  value={settings.updateInstallTime}
                  disabled={controlsDisabled || !settings.autoInstallUpdates}
                  onChange={(event) => {
                    const value = event.target.value
                    if (!value) return
                    void patch({ updateInstallTime: value })
                  }}
                  className="h-9 w-48 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
                />
              </SettingsRow>
            </>
          ) : null}
          <Separator />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">{updateStatus.message}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={controlsDisabled || isChecking}
                onClick={() => {
                  void checkForUpdates()
                }}
              >
                {isChecking ? 'Checking…' : 'Check for updates'}
              </Button>
              {canInstall ? (
                <Button
                  type="button"
                  disabled={controlsDisabled}
                  onClick={() => {
                    void installUpdate()
                  }}
                >
                  Install update
                </Button>
              ) : null}
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title="Regional">
          <SettingsRow title="Date format" description="How dates will be displayed in the app.">
            <Select
              value={settings.dateFormat}
              disabled={controlsDisabled}
              onValueChange={(value) => {
                void patch({ dateFormat: value as typeof settings.dateFormat })
              }}
            >
              <SelectTrigger className="w-48" aria-label="Date format">
                <SelectValue placeholder="Date format" />
              </SelectTrigger>
              <SelectContent>
                {DATE_FORMATS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingsRow>
          <Separator />
          <SettingsRow title="Time format" description="12-hour or 24-hour clock.">
            <Select
              value={settings.timeFormat}
              disabled={controlsDisabled}
              onValueChange={(value) => {
                void patch({ timeFormat: value as typeof settings.timeFormat })
              }}
            >
              <SelectTrigger className="w-48" aria-label="Time format">
                <SelectValue placeholder="Time format" />
              </SelectTrigger>
              <SelectContent>
                {TIME_FORMATS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === '12h' ? '12-hour' : '24-hour'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingsRow>
          <Separator />
          <SettingsRow title="Timezone" description="IANA timezone for dates and times.">
            <Select
              value={settings.timezone}
              disabled={controlsDisabled}
              onValueChange={(value) => {
                void patch({ timezone: value })
              }}
            >
              <SelectTrigger className="w-56" aria-label="Timezone">
                <SelectValue placeholder="Timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingsRow>
          <Separator />
          <SettingsRow
            title="Preview"
            description="Dates and times update as soon as you change the options above."
          >
            <p className="text-sm font-medium text-foreground tabular-nums">
              {formatDateTime(now)}
            </p>
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title="About">
          <div className="flex flex-col gap-1 text-sm">
            <p className="font-medium text-foreground">{appName}</p>
            <p className="text-muted-foreground">Version {meta?.version ?? '—'}</p>
            <p className="text-muted-foreground">{meta?.platform ?? '—'}</p>
            {siteUrl ? (
              <a
                href={siteUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 w-fit text-sm underline underline-offset-4 hover:text-foreground"
              >
                {siteLabel}
              </a>
            ) : null}
          </div>
        </SettingsSection>
      </div>
    </div>
  )
}
