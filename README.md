# ORRBIT Desktop

A starting point for a native **macOS and Windows** app. It ships the parts every desktop product needs first: a welcome screen, Clerk sign-in and sign-up, a signed-in shell, settings, and installers. The signed-in home is empty on purpose so you can build the rest of the product on top of it.

**Owner:** [Orrbit Technologies](https://www.orrbit.co.za/)  
**Site:** [https://www.orrbit.co.za/](https://www.orrbit.co.za/)

This package is the desktop client for ORRBIT. Auth uses the same Clerk application as the web and mobile apps. Styling uses the same shadcn / Tailwind tokens.

| If you want to… | Read |
| --- | --- |
| Install dependencies and run the app | [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md) |
| See how the code is laid out and where to add a screen | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Follow local-dev, auth, and packaging rules | [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) |

---

## What you get

| Area | What it does |
| --- | --- |
| Welcome (`/`) | Landing page with Google and email sign-in |
| Sign-in / sign-up | Clerk, inside the window, including Google OAuth |
| Signed-in shell | Sidebar, header, theme, and sign-out |
| Home (`/dashboard`) | Empty welcome page — replace this with your product |
| Settings (`/settings`) | Theme, language, date and time, launch behaviour, updates, About |
| Desktop bridge | `window.api` talks to the main process for settings and updates |
| Installers | macOS `.dmg` and Windows NSIS `.exe` |

It does **not** include API data, role-based navigation, or the full web dashboard. Add those on this shell.

---

## Stack

- [Electron](https://www.electronjs.org/) 39 with [electron-vite](https://electron-vite.org/)
- React 19, TypeScript, React Router 7
- [Clerk](https://clerk.com/) (`@clerk/react`) for auth
- Tailwind CSS 4 and shadcn-style UI components
- electron-builder for Mac and Windows packages
- electron-updater (checks run in packaged builds once a publish feed exists)

Three processes share types in `src/shared/`:

- **Main** (`src/main`) — window, `orrbit://` protocol, settings file, updater
- **Preload** (`src/preload`) — exposes `window.api` with context isolation on
- **Renderer** (`src/renderer`) — the React UI

---

## Setup

From this folder:

```bash
yarn install
cp .env.example .env
```

Set `VITE_CLERK_PUBLISHABLE_KEY` in `.env` to the same publishable key the web app uses (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`). Do not put `CLERK_SECRET_KEY` in this file. The renderer can only see `VITE_` variables, and a secret key does not belong in a desktop bundle.

Then:

```bash
yarn dev
```

The Electron window loads `http://localhost:5173`. Unsigned users see the welcome page. After sign-in they land on `/dashboard`. Sign-out returns to the welcome page.

Full steps, Node and Yarn versions, and Clerk origin setup are in [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md).

---

## Scripts

| Script | What it does |
| --- | --- |
| `yarn dev` | Electron + Vite. Use this to sign in and build UI. |
| `yarn typecheck` | TypeScript check for main, preload, and renderer |
| `yarn build` | Typecheck, then compile into `out/` |
| `yarn start` | Preview the compiled app (`orrbit://renderer`) |
| `yarn build:mac` | `.dmg` for the Mac you are on (run on macOS) |
| `yarn build:win` | NSIS installer (run on Windows) |
| `yarn build:unpack` | Unpacked app directory, no installer |

The publishable key is compiled in at build time. `.env` must be set before `yarn build` or any `build:*` script. `.env` is not shipped inside the installer.

Installers land in `dist/`. Unsigned Mac builds need a right-click → Open the first time. Unsigned Windows builds show a SmartScreen warning. Signing and notarization are off until you add an Apple Developer account or an Authenticode certificate. See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

---

## Build the next screen

1. Add a route in `src/renderer/src/lib/nav-routes.ts`.
2. Add a page component under `src/renderer/src/pages/`.
3. Register it in `PAGE_BY_PATH` in `src/renderer/src/App.tsx`.

The sidebar reads `NAV_ROUTES`, so the new item shows up without a separate menu edit. Details and the IPC pattern are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Product identity

Window title, About panel, and installer name come from `.env`:

| Variable | Default |
| --- | --- |
| `VITE_APP_NAME` | `ORRBIT` |
| `VITE_APP_URL` | `https://www.orrbit.co.za/` |
| `VITE_APP_VERSION` | `0.1.0` |
| `VITE_APP_ID` | `za.co.orrbit.desktop` |

`VITE_APP_ID` is the macOS bundle id and the Windows App User Model ID. Keep it reverse-DNS. Do not use `com.electron.*`.
