// Used by vite.config.js on `vite build`: a hosted build must know the backend's public address.
// It refuses to build with no address or with a local one, so the site can never call localhost.
export function assertHostedApiUrl(url) {
  if (!url) {
    throw new Error('VITE_API_URL is not set. Set it to your hosted backend address, e.g. https://deepweed-backend.onrender.com (see DEPLOY.md).')
  }
  if (!/^https?:\/\//i.test(url)) throw new Error(`VITE_API_URL must start with https:// (got "${url}")`)
  if (/^https?:\/\/(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.)/i.test(url)) {
    throw new Error(`VITE_API_URL points to a local address (${url}). Use the hosted backend address instead.`)
  }
}
