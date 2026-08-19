import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const shared = resolve('src/shared')

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@shared': shared
      }
    }
  },
  preload: {
    resolve: {
      alias: {
        '@shared': shared
      }
    }
  },
  renderer: {
    server: {
      port: 5173,
      strictPort: true,
      fs: {
        allow: [resolve('.'), shared]
      }
    },
    resolve: {
      alias: [
        { find: '@shared', replacement: shared },
        { find: '@renderer', replacement: resolve('src/renderer/src') },
        { find: '@', replacement: resolve('src/renderer/src') }
      ]
    },
    plugins: [react(), tailwindcss()]
  }
})
