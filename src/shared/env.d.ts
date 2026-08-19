/// <reference types="electron-vite/node" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string
  readonly VITE_APP_URL?: string
  readonly VITE_APP_VERSION?: string
  readonly VITE_APP_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
