import { app, BrowserWindow, ipcMain } from 'electron'
import {
  SETTINGS_IPC,
  UPDATER_IPC,
  type AppSettings,
  type AppSettingsMeta
} from '../shared/app-settings'
import { APP_ID, APP_NAME, APP_URL, APP_VERSION } from '../shared/product'
import {
  applyRuntimeSettings,
  loadSettings,
  updateSettings
} from './settings-store'
import { checkForUpdates, configureUpdater, getUpdateStatus, installUpdate } from './updater'

const PLATFORM_LABELS: Record<string, string> = {
  darwin: 'macOS',
  win32: 'Windows',
  linux: 'Linux'
}

/**
 * Push the latest settings to every renderer so controls apply without a reload.
 */
function broadcastSettings(settings: AppSettings): void {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send(SETTINGS_IPC.changed, settings)
  }
}

/**
 * Register settings and updater IPC handlers for the renderer.
 */
export function registerSettingsIpc(): void {
  ipcMain.handle(SETTINGS_IPC.get, () => loadSettings())

  ipcMain.handle(SETTINGS_IPC.set, async (_event, patch: Partial<AppSettings>) => {
    const next = updateSettings(patch)
    applyRuntimeSettings(next)
    await configureUpdater(next)
    broadcastSettings(next)
    return next
  })

  ipcMain.handle(SETTINGS_IPC.getMeta, (): AppSettingsMeta => {
    return {
      name: APP_NAME,
      version: APP_VERSION || app.getVersion(),
      platform: PLATFORM_LABELS[process.platform] ?? process.platform,
      packaged: app.isPackaged,
      url: APP_URL,
      appId: APP_ID
    }
  })

  ipcMain.handle(UPDATER_IPC.check, () => checkForUpdates())
  ipcMain.handle(UPDATER_IPC.install, () => installUpdate())
  ipcMain.handle(UPDATER_IPC.getStatus, () => getUpdateStatus())
}
