# Development

How to work in this repo without breaking sign-in, the Mac/Windows shell, or the split between the page and the main process.

## Daily loop

```bash
yarn dev          # window + hot reload for the renderer
yarn typecheck    # main (tsconfig.node.json) and renderer (tsconfig.web.json)
```

Renderer edits refresh in the open window. Main and preload edits restart Electron. If the window never comes back after a main-process change, check that another `yarn dev` is not already bound to port `5173` (`strictPort` in `electron.vite.config.ts`).

`yarn start` loads the last `yarn build` through `orrbit://renderer`. Use it when you need to see packaged-origin behaviour without making an installer. It is not a substitute for `yarn dev` while you are editing UI.

## What belongs in which process

| Put it in the renderer | Put it in main |
| --- | --- |
| Layout, forms, Clerk components | Files, `userData`, login items |
| React state and route changes | Protocol handler, single-instance lock |
| Calls to your HTTPS API with the Clerk session | Auto-update, native menus, OS dialogs |

The preload file should stay a thin list of `invoke` / `on` wrappers. Business rules belong in main (validation, disk) or in the renderer (UI), not in both.

When you add an IPC channel:

- Name it `area:action` (existing: `settings:get`, `updater:check`).
- Type the payload in `src/shared` and use that type on both sides.
- Treat every `ipcRenderer` payload as untrusted in main and sanitize it.

## Auth

`VITE_CLERK_PUBLISHABLE_KEY` is the only Clerk credential in this app. It is inlined into the renderer bundle. Rotating it means changing `.env` and rebuilding any installer you ship.

Dev origin: `http://localhost:5173`.  
Packaged origin: `orrbit://renderer`.

Clerk must allow the origin you are actually running. A key that works in `yarn dev` still fails in a `.dmg` until `orrbit://renderer` is on that instance’s allowed origins.

The Dashboard often cannot save a custom scheme. Use the Backend API, and send the **full** origin list — `PATCH` replaces it:

```bash
curl -X PATCH https://api.clerk.com/v1/instance \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{"allowed_origins":["https://loro.co.za","https://www.loro.co.za","http://localhost:5173","orrbit://renderer"]}'
```

Use the secret for the same instance as the desktop publishable key (`pk_test_…` with a test secret, `pk_live_…` with a live secret). Keep that secret in your shell or CI, not in `desktop/.env`.

If Google returns a redirect error in the installed app, add `orrbit://renderer/sso-callback` to Clerk’s redirect URLs. If the installed app shows a Cloudflare challenge on sign-in, turn off bot protection for that Clerk instance (same constraint as other non-browser clients).

Changing allowed origins does not require a rebuild. Changing the publishable key does.

Content-Security-Policy is in `src/renderer/index.html`. New third-party scripts or API hosts will be blocked until you add them to `script-src` or `connect-src`. Clerk, Google, and Cloudflare hosts already listed there are required for sign-in.

## Settings and theme

Defaults live in `DEFAULT_APP_SETTINGS` (`src/shared/app-settings.ts`). Adding a field means:

1. Extend `AppSettings` and the default.
2. Teach `sanitizeSettings` to reject invalid values.
3. Apply native side effects in `src/main/settings-store.ts` if the OS must change (theme source, login item).
4. Add the control on `pages/settings.tsx`.

`launchMinimized` and `openAtLogin` no-op while `app.isPackaged` is false. Test those in a real `.app` or installed `.exe`, not only in `yarn dev`.

Language codes and timezone ids in settings are preferences for formatting. They do not load translation catalogs by themselves. Wire i18n when you add translated copy.

## Updates

`src/main/updater.ts` uses `electron-updater`. In dev, and in any packaged build without a publish feed, Settings reports that update checks are unavailable. Wiring a feed (GitHub Releases, a generic HTTPS server, or similar) is a later step; the Settings UI and IPC are already in place.

Do not call the updater from the renderer except through `window.api`.

## Packaging

Build on the OS you are shipping to.

```bash
# macOS — Apple Silicon by default on an arm64 Mac
yarn build:mac

# Intel Mac
yarn build && yarn electron-builder --mac --x64 --config electron-builder.config.cjs

# Universal Mac binary
yarn build && yarn electron-builder --mac --universal --config electron-builder.config.cjs

# Windows — run on Windows
yarn build:win
```

`electron-builder.config.cjs` reads `.env` so the installer name, version, homepage, and `appId` match `VITE_APP_*`. Icons come from `build/icon.png`.

Output in `dist/`:

| OS | Give users | They do |
| --- | --- | --- |
| macOS | `ORRBIT-<version>.dmg` | Open the image, drag ORRBIT to Applications |
| Windows | `ORRBIT Setup <version>.exe` | Run the installer, launch from the Start menu |

`notarize` is `false`. Ship signed, notarized Mac builds and Authenticode-signed Windows builds before a public release. Until then, tell testers about Gatekeeper (right-click → Open) and SmartScreen.

`yarn build:win` from macOS depends on Wine and often fails. Copy the repo to a Windows machine, `yarn install`, then `yarn build:win`.

## Product name

To retitle a fork, change the four `VITE_APP_*` values and rebuild. Also update:

- The `orrbit` scheme in `src/shared/renderer-protocol.ts` and `protocols.schemes` in `electron-builder.config.cjs` if the URL scheme should change.
- Clerk allowed origins to the new scheme.
- CSP and popup host checks in `src/main/index.ts` if the Clerk hostname changes.

Leave `VITE_APP_ID` stable across releases of the same app. Changing it makes macOS and Windows treat the build as a different application (new userData, new login item).

## Checks before you hand off a change

- `yarn typecheck` passes.
- `yarn dev`: signed-out welcome, sign-in, `/dashboard`, Settings, sign-out.
- New IPC is typed in `src/shared`, handled in main, and only reached through `window.api`.
- No secrets in `.env` beyond the publishable key, and `.env` stays untracked.
