import { app, shell, BrowserWindow } from 'electron'
import { join, resolve as resolvePath } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import appIcon from '../../resources/icon.png?asset'
import { APP_ID, APP_NAME, APP_URL, APP_VERSION } from '../shared/product'
import {
  RENDERER_SCHEME,
  RENDERER_START_URL,
  isRendererProtocolUrl
} from '../shared/renderer-protocol'
import { registerSettingsIpc } from './settings-ipc'
import { applyRuntimeSettings, loadSettings, shouldLaunchMinimized } from './settings-store'
import {
  registerRendererProtocolHandler,
  registerRendererScheme
} from './renderer-protocol'
import { initUpdater } from './updater'

registerRendererScheme()
app.setName(APP_NAME)

const PRELOAD_PATH = join(__dirname, '../preload/index.js')

let pendingDeepLink: string | null = null
let protocolHandlerRegistered = false

/**
 * Renderer URL from a process argv list (Windows / Linux deep links).
 * @param argv Command-line arguments.
 */
function extractRendererUrl(argv: string[]): string | undefined {
  return argv.find((arg) => arg.startsWith(`${RENDERER_SCHEME}://`))
}

/**
 * Register this app as the OS handler for `orrbit://`. Packaged builds only —
 * `yarn dev` would bind the Electron helper and steal the scheme from a real .app.
 */
function registerAsProtocolClient(): void {
  if (!app.isPackaged) return

  if (process.defaultApp) {
    const appPath = process.argv[1]
    if (appPath) {
      app.setAsDefaultProtocolClient(RENDERER_SCHEME, process.execPath, [
        resolvePath(appPath)
      ])
      return
    }
  }
  app.setAsDefaultProtocolClient(RENDERER_SCHEME)
}

/**
 * True when the URL is this Electron renderer (Vite, privileged scheme, or file://).
 * @param urlString Navigation or window-open URL.
 */
function isAppUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    if (isRendererProtocolUrl(urlString)) return true
    if (url.protocol === 'file:') return true
    return url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  } catch {
    return false
  }
}

/**
 * True when Clerk, Google OAuth, or the in-app callback should open inside Electron.
 * `about:blank` must be allowed so `window.open` can hand Clerk a popup instead of
 * redirecting the main window to the hosted Account Portal.
 * @param urlString Window-open URL from the renderer.
 */
function isAllowedPopupUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    if (url.protocol === 'about:') return true
    if (isAppUrl(urlString)) return true
    const { hostname } = url
    if (hostname === 'clerk.loro.co.za' || hostname === 'challenges.cloudflare.com') return true
    if (hostname === 'clerk.com' || hostname.endsWith('.clerk.com')) return true
    if (hostname.endsWith('.clerk.accounts.dev') || hostname.endsWith('.accounts.dev')) return true
    if (hostname === 'accounts.google.com' || hostname.endsWith('.google.com')) return true
    return false
  } catch {
    return false
  }
}

/**
 * Focus the existing window, or remember the URL until `createWindow` runs.
 * @param urlString `orrbit://renderer/...` deep link.
 */
function navigateToRendererUrl(urlString: string): void {
  if (!isAppUrl(urlString)) return

  const windows = BrowserWindow.getAllWindows()
  if (windows.length === 0) {
    pendingDeepLink = urlString
    return
  }

  const win = windows[0]
  void win.loadURL(urlString)
  if (win.isMinimized()) win.restore()
  win.focus()
}

/**
 * URL the window should load: Vite in `yarn dev`, otherwise the privileged scheme.
 */
function rendererStartUrl(): string {
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    return process.env['ELECTRON_RENDERER_URL']
  }
  if (pendingDeepLink && isAppUrl(pendingDeepLink)) {
    const url = pendingDeepLink
    pendingDeepLink = null
    return url
  }
  return RENDERER_START_URL
}

function createWindow(): void {
  const settings = loadSettings()
  const hideOnLaunch = !is.dev && shouldLaunchMinimized(settings)

  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 670,
    show: false,
    autoHideMenuBar: true,
    title: APP_NAME,
    icon: appIcon,
    webPreferences: {
      preload: PRELOAD_PATH,
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    if (hideOnLaunch) {
      mainWindow.minimize()
      return
    }
    mainWindow.show()
  })

  mainWindow.webContents.on('did-fail-load', (_event, code, description, validatedURL) => {
    console.error(`[orrbit] failed to load ${validatedURL}: ${code} ${description}`)
    if (!mainWindow.isVisible()) mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    if (isAllowedPopupUrl(details.url)) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          webPreferences: {
            preload: PRELOAD_PATH,
            sandbox: false,
            contextIsolation: true,
            nodeIntegration: false
          }
        }
      }
    }
    void shell.openExternal(details.url)
    return { action: 'deny' }
  })

  /** Keep the main window on the app. Clerk Account Portal belongs in the OAuth popup. */
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (isAppUrl(url)) return
    event.preventDefault()
  })

  mainWindow.webContents.on('will-redirect', (event, url) => {
    if (isAppUrl(url)) return
    event.preventDefault()
  })

  void mainWindow.loadURL(rendererStartUrl())
}

/**
 * Packaged-only single-instance lock. `yarn dev` restarts Electron on every main
 * rebuild; taking the lock there makes the new process quit and the window never opens.
 */
function acquireInstanceLock(): boolean {
  if (!app.isPackaged) return true
  return app.requestSingleInstanceLock()
}

function bootstrap(): void {
  pendingDeepLink = extractRendererUrl(process.argv) ?? null

  app.on('second-instance', (_event, argv) => {
    const url = extractRendererUrl(argv)
    if (url) {
      navigateToRendererUrl(url)
      return
    }
    const win = BrowserWindow.getAllWindows()[0]
    if (!win) return
    if (win.isMinimized()) win.restore()
    win.focus()
  })

  app.on('open-url', (event, url) => {
    event.preventDefault()
    if (app.isReady()) {
      navigateToRendererUrl(url)
      return
    }
    pendingDeepLink = url
  })

  void app.whenReady().then(() => {
    registerAsProtocolClient()
    if (!is.dev && !protocolHandlerRegistered) {
      registerRendererProtocolHandler()
      protocolHandlerRegistered = true
    }

    electronApp.setAppUserModelId(APP_ID)
    app.setAboutPanelOptions({
      applicationName: APP_NAME,
      applicationVersion: APP_VERSION,
      version: APP_VERSION,
      copyright: APP_NAME,
      website: APP_URL
    })
    if (process.platform === 'darwin') {
      app.dock?.setIcon(appIcon)
    }

    const settings = loadSettings()
    applyRuntimeSettings(settings)
    registerSettingsIpc()
    void initUpdater(settings)

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}

if (!acquireInstanceLock()) {
  app.quit()
} else {
  bootstrap()
}
