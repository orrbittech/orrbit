const { existsSync, readFileSync } = require('fs')
const { resolve } = require('path')

/**
 * Load `desktop/.env` into `process.env` without overriding existing values.
 * electron-builder does not load Vite env files on its own.
 */
function loadDotEnv(filePath) {
  if (!existsSync(filePath)) return
  for (const rawLine of readFileSync(filePath, 'utf8').split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    const value = line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '')
    if (key && process.env[key] === undefined) process.env[key] = value
  }
}

loadDotEnv(resolve(__dirname, '.env'))

const appName = process.env.VITE_APP_NAME?.trim() || 'ORRBIT'
const appId = process.env.VITE_APP_ID?.trim() || 'za.co.orrbit.desktop'
const appUrl = process.env.VITE_APP_URL?.trim() || 'https://www.orrbit.co.za/'
const appVersion = process.env.VITE_APP_VERSION?.trim() || '0.1.0'
const npmName =
  appName
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'orrbit'

/** @type {import('electron-builder').Configuration} */
module.exports = {
  appId,
  productName: appName,
  directories: {
    buildResources: 'build'
  },
  extraMetadata: {
    name: npmName,
    productName: appName,
    version: appVersion,
    description: appName,
    homepage: appUrl
  },
  files: [
    '!**/.vscode/*',
    '!src/*',
    '!electron.vite.config.{js,ts,mjs,cjs}',
    '!electron-builder.config.cjs',
    '!{.eslintcache,eslint.config.mjs,.prettierignore,.prettierrc.yaml,CHANGELOG.md,README.md}',
    '!{.env,.env.*,.npmrc,pnpm-lock.yaml}',
    '!{tsconfig.json,tsconfig.node.json,tsconfig.web.json}'
  ],
  asarUnpack: ['resources/**'],
  mac: {
    icon: 'build/icon.png',
    entitlementsInherit: 'build/entitlements.mac.plist',
    notarize: false,
    extendInfo: {
      CFBundleName: appName,
      CFBundleDisplayName: appName,
      CFBundleIdentifier: appId
    }
  },
  dmg: {
    artifactName: '${productName}-${version}.${ext}'
  },
  win: {
    icon: 'build/icon.png',
    artifactName: '${productName} Setup ${version}.${ext}',
    executableName: appName
  },
  nsis: {
    artifactName: '${productName} Setup ${version}.${ext}',
    shortcutName: appName,
    uninstallDisplayName: appName
  },
  protocols: [
    {
      name: appName,
      schemes: ['orrbit']
    }
  ],
  npmRebuild: false
}
