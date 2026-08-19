import { existsSync } from 'fs'
import { extname, isAbsolute, join, relative, resolve } from 'path'
import { pathToFileURL } from 'url'
import { app, net, protocol } from 'electron'
import { RENDERER_SCHEME } from '../shared/renderer-protocol'

const ASSET_PATH = /\.(js|mjs|cjs|css|map|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|eot|json|wasm|html)$/i

/**
 * True when `candidate` is the renderer root or a file inside it.
 * @param root Absolute renderer directory.
 * @param candidate Resolved file path.
 */
function isPathInside(root: string, candidate: string): boolean {
  const rel = relative(root, candidate)
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel))
}

/**
 * Register `orrbit:` as a standard, secure scheme. Must run before `app.whenReady()`.
 */
export function registerRendererScheme(): void {
  if (app.isReady()) return

  protocol.registerSchemesAsPrivileged([
    {
      scheme: RENDERER_SCHEME,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
        stream: true
      }
    }
  ])
}

/**
 * Serve the Vite renderer from `orrbit://renderer` with an SPA fallback for Clerk path routes.
 */
export function registerRendererProtocolHandler(): void {
  const rendererRoot = join(__dirname, '../renderer')
  const indexFile = join(rendererRoot, 'index.html')

  protocol.handle(RENDERER_SCHEME, (request) => {
    try {
      const url = new URL(request.url)
      const pathname = decodeURIComponent(url.pathname)
      const relativePath = pathname.replace(/^\/+/, '')
      const candidate = relativePath ? resolve(rendererRoot, relativePath) : indexFile

      if (!isPathInside(rendererRoot, candidate)) {
        return new Response('Forbidden', { status: 403 })
      }

      if (ASSET_PATH.test(pathname)) {
        if (existsSync(candidate)) {
          return net.fetch(pathToFileURL(candidate).href)
        }
        return new Response('Not found', { status: 404 })
      }

      const file =
        extname(candidate) && existsSync(candidate) ? candidate : indexFile
      return net.fetch(pathToFileURL(file).href)
    } catch {
      return new Response('Protocol handler error', { status: 500 })
    }
  })
}
