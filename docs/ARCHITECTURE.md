# Architecture

ORRBIT Desktop is an Electron app with a React UI. The signed-in area is a shell: navigation, settings, and a bridge to the operating system. Product screens go in the renderer. Operating-system work stays in the main process.

## Processes

```
src/
  main/         Node + Electron. Window, files, protocol, updater.
  preload/      The only bridge into the page. Exposes window.api.
  renderer/     React. No Node, no fs, no Clerk secret.
  shared/       Types and constants imported by all three.
```

electron-vite compiles each process separately. Aliases:

| Alias | Points at |
| --- | --- |
| `@shared` | `src/shared` |
| `@` and `@renderer` | `src/renderer/src` (renderer only) |

`contextIsolation` is on and `nodeIntegration` is off. The page cannot `require('electron')`. Anything the UI needs from the OS goes through `window.api` in `src/preload/index.ts`.

## How a screen loads

`yarn dev` loads the Vite URL (`http://localhost:5173`). Packaged builds and `yarn start` load `orrbit://renderer/` via a privileged custom protocol (`src/main/renderer-protocol.ts`, `src/shared/renderer-protocol.ts`). That origin is what Clerk accepts. The app does not load the UI from `file://`.

`src/renderer/src/main.tsx` wraps the tree:

1. `ThemeProvider` — light, dark, or system (`next-themes`, `class` on `<html>`).
2. `DesktopSettingsProvider` — loads `window.api.getSettings()` and keeps the page in sync.
3. `BrowserRouter` + `ClerkProvider` — Clerk navigation uses React Router, not full page loads.

`src/renderer/src/App.tsx` splits routes:

| Route | Guard | UI |
| --- | --- | --- |
| `/sso-callback` | none | Finishes Google / OAuth |
| `/`, `/sign-in/*`, `/sign-up/*` | guest | Welcome and auth forms |
| `/dashboard`, `/settings` | signed in | `AppShell` (sidebar + header) |
| anything else | — | Sends guests to `/`, signed-in users to `/dashboard` |

## What is already in the UI

| Path | Role |
| --- | --- |
| `pages/landing.tsx` | Welcome |
| `pages/sign-in.tsx`, `pages/sign-up.tsx` | Clerk forms |
| `pages/sso-callback.tsx` | OAuth return |
| `pages/home.tsx` | Empty signed-in home |
| `pages/settings.tsx` | Appearance, system, updates, regional, About |
| `components/app-shell.tsx` | Sidebar + header frame |
| `components/app-sidebar.tsx` | Nav from `NAV_ROUTES` |
| `components/app-header.tsx` | Title, theme, account menu |
| `components/ui/*` | shadcn-style primitives (button, dialog, sidebar, select, switch, …) |
| `components/theme-provider.tsx` | Theme |
| `lib/nav-routes.ts` | Signed-in route table |
| `lib/product.ts` | Re-exports `APP_NAME`, `APP_URL`, `APP_VERSION`, `APP_ID` |

Copy in the window title, About panel, and footer reads `src/shared/product.ts`, which falls back to ORRBIT branding when env vars are missing.

## Add a signed-in page

`NAV_ROUTES` is the menu. `PAGE_BY_PATH` is the screen. Keep them in sync.

1. Add the path in `src/renderer/src/lib/nav-routes.ts`:

```ts
export const NAV_ROUTES = [
  { path: HOME_PATH, label: 'Home' },
  { path: '/settings', label: 'Settings' },
  { path: '/reports', label: 'Reports' }
] as const
```

2. Create `src/renderer/src/pages/reports.tsx` and export a component.
3. Register it in `src/renderer/src/App.tsx`:

```ts
const PAGE_BY_PATH = {
  [HOME_PATH]: <HomePage />,
  '/settings': <SettingsPage />,
  '/reports': <ReportsPage />
} as const
```

`App.tsx` maps `NAV_ROUTES` onto `PAGE_BY_PATH`, and the sidebar maps the same list. A path in the nav without a page entry is a type error.

Guest-only routes stay outside `ProtectedRoute`. Do not add product pages to the guest group.

## Add an OS feature

Follow the settings feature. It is the pattern for anything that touches disk, login items, or native dialogs.

1. **Shared contract** — types and channel names in `src/shared/` (see `AppSettings` and `SETTINGS_IPC` in `app-settings.ts`). Main and renderer import this file. They do not invent parallel types.
2. **Main handler** — `ipcMain.handle` in `src/main/` (see `settings-ipc.ts`). Validate input before writing. `sanitizeSettings` is the model: drop unknown or invalid fields, then persist.
3. **Preload** — add a method on `DesktopApi` and implement it with `ipcRenderer.invoke` or `ipcRenderer.on`. Return an unsubscribe function for events, the way `onSettingsChanged` does.
4. **Renderer** — call `window.api` from a hook or provider. Do not import `electron` or `fs` in `src/renderer`.

`window.api` today:

| Method | Purpose |
| --- | --- |
| `getSettings` / `setSettings` | Read and patch `settings.json` |
| `onSettingsChanged` | Live updates after a patch |
| `getMeta` | Name, version, platform, packaged flag, app id |
| `checkForUpdates` / `installUpdate` / `getUpdateStatus` / `onUpdateStatus` | electron-updater status for Settings |

## Where state lives

| State | Where |
| --- | --- |
| Clerk session | Clerk, in the renderer |
| Theme, language, formats, login, update prefs | `userData/settings.json`, owned by main |
| Route | React Router |
| Update progress | Main process, pushed to the page over IPC |

The renderer treats settings as remote state. `useDesktopSettings` reads them; it does not write `localStorage` for those fields.

## Window behaviour worth keeping

- External `http(s)` links open in the system browser (`shell.openExternal`). The main window does not navigate away to arbitrary sites.
- Clerk and Google popups are allowed. Other `window.open` targets are denied.
- Packaged builds take a single-instance lock and focus the existing window on a second launch. `yarn dev` does not take the lock, because Vite restarts Electron on main-process rebuilds.
- macOS keeps the process alive after the last window closes. Windows and Linux quit.
- Deep links use `orrbit://`. The packaged app registers as the OS handler. Dev builds do not, so they do not steal the scheme from an installed `.app`.

## UI conventions

- Tailwind utilities and the tokens in `src/renderer/src/globals.css`. Components live in `components/ui` and match the shadcn style already in the repo (`components.json`).
- New interactive controls should have an accessible name (`Label`, `htmlFor`, or `aria-label`).
- Prefer adding a page under `pages/` and a feature component under `components/` over growing `App.tsx`.
