import { app, BrowserWindow } from 'electron'
import { is } from '@electron-toolkit/utils'
import {
  UPDATER_IPC,
  type AppSettings,
  type UpdateInstallMode,
  type UpdateStatus
} from '../shared/app-settings'

const UNSUPPORTED_STATUS: UpdateStatus = {
  kind: 'unsupported',
  message: 'Updates are checked in packaged builds once a publish feed is configured.'
}

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000

let lastStatus: UpdateStatus = { kind: 'idle', message: 'No update check yet.' }
let eventsBound = false
let checkTimer: NodeJS.Timeout | null = null
let scheduledInstallTimer: NodeJS.Timeout | null = null
let downloadedVersion: string | undefined
let currentSettings: AppSettings | null = null

/**
 * True when electron-updater can run (packaged production build).
 */
function canUseAutoUpdater(): boolean {
  return app.isPackaged && !is.dev
}

/**
 * Broadcast updater status to every renderer window.
 * @param status Status payload for the Settings UI.
 */
function broadcast(status: UpdateStatus): void {
  lastStatus = status
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send(UPDATER_IPC.statusEvent, status)
  }
}

/**
 * Milliseconds until the next occurrence of `HH:mm` in local time.
 * @param hhmm 24-hour clock string.
 */
function msUntilInstallTime(hhmm: string): number {
  const [hours, minutes] = hhmm.split(':').map(Number)
  const now = new Date()
  const target = new Date(now)
  target.setHours(hours, minutes, 0, 0)
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1)
  }
  return target.getTime() - now.getTime()
}

/**
 * Apply a downloaded update according to the current install policy.
 */
function applyDownloadedUpdate(): void {
  if (!canUseAutoUpdater() || !downloadedVersion || !currentSettings) return
  if (!currentSettings.autoInstallUpdates) return

  const mode: UpdateInstallMode = currentSettings.updateInstallMode
  switch (mode) {
    case 'immediate':
      void import('electron-updater').then(({ autoUpdater }) => {
        autoUpdater.quitAndInstall()
      })
      return
    case 'onQuit':
      return
    case 'scheduled':
      if (scheduledInstallTimer) clearTimeout(scheduledInstallTimer)
      scheduledInstallTimer = setTimeout(() => {
        void import('electron-updater').then(({ autoUpdater }) => {
          autoUpdater.quitAndInstall()
        })
      }, msUntilInstallTime(currentSettings.updateInstallTime))
      return
    default: {
      const exhaustive: never = mode
      return exhaustive
    }
  }
}

/**
 * Bind electron-updater events once for the process lifetime.
 */
async function bindUpdaterEvents(): Promise<void> {
  if (eventsBound || !canUseAutoUpdater()) return
  eventsBound = true

  const { autoUpdater } = await import('electron-updater')

  autoUpdater.on('checking-for-update', () => {
    broadcast({ kind: 'checking', message: 'Checking for updates…' })
  })

  autoUpdater.on('update-available', (info) => {
    broadcast({
      kind: 'available',
      message: `Version ${info.version} is available.`,
      version: info.version
    })
  })

  autoUpdater.on('update-not-available', () => {
    downloadedVersion = undefined
    broadcast({ kind: 'not-available', message: 'You are on the latest version.' })
  })

  autoUpdater.on('download-progress', (progress) => {
    broadcast({
      kind: 'downloading',
      message: `Downloading update… ${Math.round(progress.percent)}%`,
      progress: progress.percent
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    downloadedVersion = info.version
    broadcast({
      kind: 'ready',
      message: `Version ${info.version} is ready to install.`,
      version: info.version
    })
    applyDownloadedUpdate()
  })

  autoUpdater.on('error', (error) => {
    broadcast({
      kind: 'error',
      message: error.message || 'Update check failed. No publish feed is configured yet.'
    })
  })
}

/**
 * Configure auto-download / install-on-quit from stored settings.
 * @param settings Current app settings.
 */
async function applyUpdaterPolicy(settings: AppSettings): Promise<void> {
  if (!canUseAutoUpdater()) return
  const { autoUpdater } = await import('electron-updater')
  autoUpdater.autoDownload = settings.autoInstallUpdates
  autoUpdater.autoInstallOnAppQuit =
    settings.autoInstallUpdates && settings.updateInstallMode === 'onQuit'
}

/**
 * Start or stop the daily update check timer.
 * @param settings Current app settings.
 */
function schedulePeriodicChecks(settings: AppSettings): void {
  if (checkTimer) {
    clearInterval(checkTimer)
    checkTimer = null
  }

  if (!settings.autoCheckUpdates || !canUseAutoUpdater()) return

  checkTimer = setInterval(() => {
    void checkForUpdates()
  }, CHECK_INTERVAL_MS)
}

/**
 * Initialize updater policy, events, and optional launch check.
 * @param settings Current app settings.
 */
export async function initUpdater(settings: AppSettings): Promise<void> {
  currentSettings = settings

  if (!canUseAutoUpdater()) {
    broadcast(UNSUPPORTED_STATUS)
    return
  }

  await bindUpdaterEvents()
  await applyUpdaterPolicy(settings)
  schedulePeriodicChecks(settings)

  if (settings.autoCheckUpdates) {
    setTimeout(() => {
      void checkForUpdates()
    }, 8_000)
  }
}

/**
 * Re-apply updater policy after the user changes settings.
 * @param settings Current app settings.
 */
export async function configureUpdater(settings: AppSettings): Promise<void> {
  currentSettings = settings
  if (!canUseAutoUpdater()) {
    broadcast(UNSUPPORTED_STATUS)
    return
  }

  await bindUpdaterEvents()
  await applyUpdaterPolicy(settings)
  schedulePeriodicChecks(settings)

  if (downloadedVersion) applyDownloadedUpdate()
}

/**
 * Last known updater status for the renderer.
 */
export function getUpdateStatus(): UpdateStatus {
  return lastStatus
}

/**
 * Check for updates (no-op with a friendly status in unpackaged builds).
 */
export async function checkForUpdates(): Promise<UpdateStatus> {
  if (!canUseAutoUpdater()) {
    broadcast(UNSUPPORTED_STATUS)
    return UNSUPPORTED_STATUS
  }

  try {
    await bindUpdaterEvents()
    const { autoUpdater } = await import('electron-updater')
    await autoUpdater.checkForUpdates()
    return lastStatus
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Update check failed. No publish feed is configured yet.'
    const status: UpdateStatus = { kind: 'error', message }
    broadcast(status)
    return status
  }
}

/**
 * Quit and install a downloaded update, or report that none is ready.
 */
export async function installUpdate(): Promise<UpdateStatus> {
  if (!canUseAutoUpdater()) {
    broadcast(UNSUPPORTED_STATUS)
    return UNSUPPORTED_STATUS
  }

  if (!downloadedVersion) {
    const status: UpdateStatus = {
      kind: lastStatus.kind === 'ready' ? 'ready' : 'idle',
      message: 'No update is ready to install.'
    }
    broadcast(status)
    return status
  }

  const { autoUpdater } = await import('electron-updater')
  autoUpdater.quitAndInstall()
  return lastStatus
}
