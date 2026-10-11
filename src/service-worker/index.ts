import { self } from '$app/service-worker'

import { respondWithREPLFiles } from './respond'

self.addEventListener('install', () => {
  console.debug('[webrepl:sw] Service worker installing...')
  console.debug('[webrepl:sw] Skipping waiting...')
  self.skipWaiting()
})

self.addEventListener('activate', (event: ExtendableEvent) => {
  console.debug('[webrepl:sw] Service worker activating...')
  // take control of already-open pages so the preview works on first load
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url)

  if (url.pathname.startsWith('/preview/')) {
    event.respondWith(respondWithREPLFiles(event))
  }
})
