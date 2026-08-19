import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  SETTINGS_IPC,
  UPDATER_IPC,
  type AppSettings,
  type DesktopApi,
  type UpdateStatus
} from '../shared/app-settings'

const api: DesktopApi = {
  getSettings: () => ipcRenderer.invoke(SETTINGS_IPC.get),
  setSettings: (patch: Partial<AppSettings>) => ipcRenderer.invoke(SETTINGS_IPC.set, patch),
  getMeta: () => ipcRenderer.invoke(SETTINGS_IPC.getMeta),
  checkForUpdates: () => ipcRenderer.invoke(UPDATER_IPC.check),
  installUpdate: () => ipcRenderer.invoke(UPDATER_IPC.install),
  getUpdateStatus: () => ipcRenderer.invoke(UPDATER_IPC.getStatus),
  onUpdateStatus: (listener: (status: UpdateStatus) => void) => {
    const handler = (_event: unknown, status: UpdateStatus): void => {
      listener(status)
    }
    ipcRenderer.on(UPDATER_IPC.statusEvent, handler)
    return () => {
      ipcRenderer.removeListener(UPDATER_IPC.statusEvent, handler)
    }
  },
  onSettingsChanged: (listener: (settings: AppSettings) => void) => {
    const handler = (_event: unknown, settings: AppSettings): void => {
      listener(settings)
    }
    ipcRenderer.on(SETTINGS_IPC.changed, handler)
    return () => {
      ipcRenderer.removeListener(SETTINGS_IPC.changed, handler)
    }
  }
}

declare global {
  interface Window {
    electron: typeof electronAPI
    api: DesktopApi
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
