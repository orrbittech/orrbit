# ORRBIT Desktop Template

This is a **desktop template app** (Electron + TypeScript). It is a starting shell for a native Mac and Windows client: welcome landing, Clerk sign-in / sign-up, and an empty signed-in workspace.

It is **owned by the same Orrbit** as the rest of the ORRBIT product line.

**Owner:** [Orrbit Technologies](https://www.orrbit.co.za/)  
**Site:** [https://www.orrbit.co.za/](https://www.orrbit.co.za/)

Do not treat this package as a separate product or a third-party starter. Auth uses the **same Clerk application** (same publishable key) as `web/` and `apk/`. Styling follows the same shadcn / Tailwind tokens as `web/`.

---

## What this template includes

- Welcome landing (`/`) with Google and email sign-in
- Clerk sign-in / sign-up (same keys as web)
- Signed-in shell with sidebar, header, and empty pages
- Footer attribution: [a product of orrbit technologies](https://www.orrbit.co.za/)

It does **not** include API data, role-based nav, or the full ORRBIT web dashboard. Those can be added on top of this template.

---

## Setup

Work from this folder so Yarn and Electron resolve correctly:

```bash
cd desktop
yarn install
```

Copy `.env.example` to `.env` and set:

```
VITE_CLERK_PUBLISHABLE_KEY=
```

Use the same value as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in `web/.env`.

- **Do not** add `CLERK_SECRET_KEY`. This app is renderer-only.
- After changing the key, restart `yarn dev`.

If Clerk reports an invalid origin, add `http://localhost:5173` (dev) and `orrbit://renderer` (packaged) in [Clerk Dashboard](https://dashboard.clerk.com) → Native applications / allowed origins. Development (`pk_test_`) instances usually allow localhost by default; custom schemes must be added via the Backend API (see Packaged sign-in below).

---

## Local development

```bash
cd desktop
yarn dev
```

This opens the Electron window at `http://localhost:5173`. That HTTP origin is the supported way to test Clerk sign-in during development. Packaged builds use `orrbit://renderer` instead of `file://`.

| Script | What it does |
| --- | --- |
| `yarn dev` | Electron + Vite (use this to sign in) |
| `yarn typecheck` | TypeScript check for main and renderer |
| `yarn build` | Typecheck + compile into `out/` |
| `yarn start` | Preview the compiled app |

Unsigned users see the ORRBIT welcome page. After sign-in they get the sidebar / header shell. Sign-out returns to the landing page.

---

## Build installers (Mac and Windows)

The Clerk publishable key is **baked in at build time**. `desktop/.env` must be set **before** you run any package command. The key is compiled into the renderer; `.env` is not shipped inside the installer.

electron-builder uses `desktop/build/icon.png` (the OrrbiT launch logo) for the Mac app icon and the Windows `.exe` icon.

Installers are written to `desktop/dist/`.

### Mac (`.dmg`) — run on a Mac

```bash
cd desktop
yarn build:mac
```

What you get:

| File | Who uses it |
| --- | --- |
| `ORRBIT-0.1.0.dmg` (or similar) | End users: open the disk image, drag the app to Applications, launch |
| `mac/` or `mac-arm64/*.app` | The raw app bundle |

This Mac is Apple Silicon, so the default build is **arm64**. For Intel Macs:

```bash
yarn build && yarn electron-builder --mac --x64
```

For both architectures in one app:

```bash
yarn build && yarn electron-builder --mac --universal
```

Unsigned Mac builds are blocked by Gatekeeper until the user right-clicks the app → **Open**, or until you sign and notarize with an Apple Developer account. Notarization is currently off (`notarize: false` in `electron-builder.yml`).

### Windows (`.exe` installer) — run on a Windows PC

```bash
cd desktop
yarn build:win
```

What you get:

| File | Who uses it |
| --- | --- |
| `ORRBIT Setup 0.1.0.exe` (NSIS) | End users: run the installer, then launch from the Start menu |
| Portable `.exe` (if produced) | Run without installing |

**Build Windows on Windows.** Building a Windows installer from macOS needs Wine and often fails. Copy this `desktop/` folder (or the git repo) to a Windows machine, run `yarn install`, then `yarn build:win`.

Unsigned Windows builds show a SmartScreen warning until you sign with an Authenticode certificate.

### What users install

| OS | Give them | They do |
| --- | --- | --- |
| macOS | the `.dmg` from `dist/` | Open it, drag **ORRBIT** into Applications, open the app |
| Windows | the `Setup.exe` from `dist/` | Run it, finish the wizard, open the app from Start |

---

## Packaged sign-in

`yarn dev` uses `http://localhost:5173`. Packaged `.dmg` / `.exe` builds (and `yarn start`) load the UI from **`orrbit://renderer`**, which Clerk can treat as a real origin. `file://` is no longer used for the packaged window.

Clerk still has to allow that origin on the **same instance as `VITE_CLERK_PUBLISHABLE_KEY`**.

1. In the [Clerk Dashboard](https://dashboard.clerk.com) → **Native applications**, enable the Native API.
2. Add `orrbit://renderer` to the instance allowed origins. The Dashboard often cannot add custom schemes; use the Backend API and **include every existing origin** (this `PATCH` replaces the list):

```bash
curl -X PATCH https://api.clerk.com/v1/instance \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{"allowed_origins":["https://loro.co.za","https://www.loro.co.za","http://localhost:5173","orrbit://renderer"]}'
```

Use the secret key for the same instance as the desktop publishable key (`pk_live_…` vs `pk_test_…`). Do not put that secret in `desktop/.env`.

3. If Google OAuth returns a redirect error, add `orrbit://renderer/sso-callback` under Clerk redirect URLs / paths.
4. If sign-in shows a Cloudflare / bot-protection error in the installed app, disable bot protection for that instance (same limitation as Chrome extensions).

After changing allowed origins, rebuild is not required — only the Clerk instance config is. Rebuild if you changed `VITE_CLERK_PUBLISHABLE_KEY`.

---

## Ownership

| | |
| --- | --- |
| Template | ORRBIT desktop (this folder) |
| Owner | Orrbit Technologies |
| Public site | [https://www.orrbit.co.za/](https://www.orrbit.co.za/) |
| Same Clerk app as | `web/` and `apk/` |

This template stays under Orrbit. Do not rebrand it as an independent app or point auth at a different Clerk project unless that is an explicit product decision.
