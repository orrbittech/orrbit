# Getting started

This app is a Mac and Windows shell. Follow these steps once, then use `yarn dev` for day-to-day work.

## What you need

| Tool | Version |
| --- | --- |
| Node.js | 22 (matches `@types/node` in this repo) |
| Yarn Classic | 1.22.22 (`packageManager` in `package.json`) |
| macOS | To run the app and to build a `.dmg` |
| Windows | To build the `.exe` installer |

A Clerk account that already has the ORRBIT application. Desktop, web, and mobile share one publishable key.

## 1. Install

From this `desktop` folder:

```bash
yarn install
```

`postinstall` rebuilds native modules for the Electron version in `package.json`. If you switch Electron versions later, run `yarn install` again.

## 2. Environment

```bash
cp .env.example .env
```

`.env.example` lists every variable the app reads:

```
VITE_CLERK_PUBLISHABLE_KEY=
VITE_APP_NAME=ORRBIT
VITE_APP_URL=https://www.orrbit.co.za/
VITE_APP_VERSION=0.1.0
VITE_APP_ID=za.co.orrbit.desktop
```

Set `VITE_CLERK_PUBLISHABLE_KEY` to the same value as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in the web app’s `.env`.

Rules:

- Only `VITE_` variables are visible to the React app. Vite inlines them at build time.
- Do not add `CLERK_SECRET_KEY`. Main, preload, and renderer must not hold a Clerk secret.
- Restart `yarn dev` after any `.env` change. Vite does not hot-reload env files.

## 3. Run

```bash
yarn dev
```

You should get an Electron window titled **ORRBIT**, loading `http://localhost:5173`.

| You are | You see |
| --- | --- |
| Signed out | Welcome page at `/` |
| Signing in | `/sign-in` or `/sign-up` inside the window |
| Signed in | Sidebar shell and `/dashboard` |

If the window stays blank, check the terminal for `Missing VITE_CLERK_PUBLISHABLE_KEY`. The renderer throws on startup when that variable is empty.

## 4. Allow the dev origin in Clerk

Development instances (`pk_test_…`) usually allow `http://localhost:5173` already. If Clerk shows an invalid-origin error:

1. Open [Clerk Dashboard](https://dashboard.clerk.com) → the same instance as the publishable key.
2. Enable **Native applications** (Native API).
3. Allow `http://localhost:5173`.

Google sign-in opens an Electron popup, then returns to `/sso-callback` inside the app. You do not leave the window for the hosted Account Portal during normal sign-in.

## 5. Confirm the shell

After you can sign in:

- **Home** is the empty welcome page. This is the slot for product UI.
- **Settings** changes theme, language, date and time format, open-at-login, and update preferences. Theme applies immediately. Open-at-login only applies in a packaged build; `yarn dev` skips it because macOS rejects login-item changes on the unsigned Electron helper.
- **Sign out** (header menu) returns to `/`.

Settings are stored in Electron’s `userData` directory as `settings.json`. Deleting that file resets them to the defaults in `src/shared/app-settings.ts`.

## Next

- Add a page: [ARCHITECTURE.md](ARCHITECTURE.md)
- Package a `.dmg` or `.exe`, and allow `orrbit://renderer` on Clerk: [DEVELOPMENT.md](DEVELOPMENT.md)
