// ChrissysProxy v15 service worker. Scramjet manages its own IndexedDB schema;
// ChrissysProxy deliberately does not inspect, delete, or close Scramjet databases.
importScripts('/scram/scramjet.all.js?build=chrissysproxy-20261031-23');

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();
const SCRAMJET_PREFIX = '/~/sj/';

async function loadScramjetConfig() {
  let lastError;
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      await scramjet.loadConfig();
      if (typeof scramjet.config?.prefix === 'string' && scramjet.config.prefix) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw lastError || new Error('Scramjet configuration is not ready. Reload ChrissysProxy and try again.');
}

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  // ChrissysProxy shell, BareMux, WASM, and transport files must bypass Scramjet.
  if (!requestUrl.pathname.startsWith(SCRAMJET_PREFIX)) return;

  event.respondWith((async () => {
    try {
      await loadScramjetConfig();
      // This handler already filters to the Scramjet prefix above. Calling
      // route() here re-reads config.prefix and can race a worker update even
      // after config readiness was confirmed; pass the known proxy request on.
      return await scramjet.fetch(event);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const details = { name: error?.name || 'Error', message, url: event.request.url };
      console.error('ChrissysProxy Scramjet request failed:', details);
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clients) client.postMessage({ type: 'CHRISSYSPROXY_SCRAMJET_ERROR', details });
      return new Response(`ChrissysProxy proxy request failed: ${message}`, {
        status: 502,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }
      });
    }
  })());
});
