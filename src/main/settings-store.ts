import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { app, nativeTheme } from 'electron'
import { DEFAULT_APP_SETTINGS, sanitizeSettings, type AppSettings } from '../shared/app-settings'

/**
 * Absolute path to the persisted settings JSON file.
 */
function settingsFilePath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

/**
 * Load app settings from disk, falling back to defaults when missing or invalid.
 */
export function loadSettings(): AppSettings {
  try {
    const raw = readFileSync(settingsFilePath(), 'utf8')
    const parsed = JSON.parse(raw) as Partial<AppSettings>
    return sanitizeSettings(parsed)
  } catch {
    return { ...DEFAULT_APP_SETTINGS }
  }
}

/**
 * Persist settings to `settings.json` in the userData directory.
 * @param settings Fully sanitized settings object.
 */
export function saveSettings(settings: AppSettings): void {
  mkdirSync(app.getPath('userData'), { recursive: true })
  writeFileSync(settingsFilePath(), JSON.stringify(settings, null, 2), 'utf8')
}

/**
 * Merge a partial patch onto stored settings, persist, and return the result.
 * @param patch Fields to update.
 */
export function updateSettings(patch: Partial<AppSettings>): AppSettings {
  const next = sanitizeSettings({ ...loadSettings(), ...patch })
  saveSettings(next)
  return next
}

/**
 * Apply theme to Electron's native chrome (title bar / menus) immediately.
 * @param settings Current app settings.
 */
export function applyAppearanceSettings(settings: AppSettings): void {
  nativeTheme.themeSource = settings.theme
}

/**
 * Apply open-at-login / launch-minimized to the OS login item.
 * Skipped in `yarn dev`: macOS rejects login-item changes on the unsigned Electron helper.
 * @param settings Current app settings.
 */
export function applyLoginItemSettings(settings: AppSettings): void {
  if (!app.isPackaged) return

  app.setLoginItemSettings({
    openAtLogin: settings.openAtLogin,
    openAsHidden: settings.launchMinimized
  })
}

/**
 * Apply every OS-level setting that can take effect without a relaunch.
 * @param settings Current app settings.
 */
export function applyRuntimeSettings(settings: AppSettings): void {
  applyAppearanceSettings(settings)
  applyLoginItemSettings(settings)
}

/**
 * True when this launch should stay hidden (login item + launch minimized).
 */
export function shouldLaunchMinimized(settings: AppSettings): boolean {
  if (!settings.launchMinimized) return false
  const login = app.getLoginItemSettings()
  return Boolean(login.wasOpenedAtLogin || login.wasOpenedAsHidden)
}
