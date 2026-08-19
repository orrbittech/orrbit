import { useSyncExternalStore } from 'react'

const MOBILE_BREAKPOINT = 768

function subscribe(callback: () => void) {
  window.addEventListener('resize', callback)
  return () => window.removeEventListener('resize', callback)
}

function getSnapshot() {
  return typeof window !== 'undefined' ? window.innerWidth : 0
}

function getServerSnapshot() {
  return 0
}

export function useIsMobile() {
  const width = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return width > 0 && width < MOBILE_BREAKPOINT
}
