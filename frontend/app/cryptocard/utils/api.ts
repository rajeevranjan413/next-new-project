/**
 * Minimal API client (no axios dependency — uses fetch).
 *
 * Base URL comes from NEXT_PUBLIC_API_BASE_URL in your .env, e.g.
 *   NEXT_PUBLIC_API_BASE_URL=https://api.example.com
 * Paths passed to apiCall are relative to it, e.g. 'users/user-details-from-hash'.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL  || ''

function buildUrl(path) {
  const base = API_BASE_URL.replace(/\/+$/, '')
  const rel = String(path).replace(/^\/+/, '')
  return base ? `${base}/${rel}` : `/${rel}`
}

/**
 * @param {string} method  HTTP method ('GET' | 'POST' | ...)
 * @param {string} path    Path relative to NEXT_PUBLIC_API_BASE_URL
 * @param {object} [data]  JSON body (for non-GET requests)
 * @returns {Promise<any>} Parsed JSON response (or null if no body)
 */
export async function apiCall(method, path, data) {
  const res = await fetch(buildUrl(path), {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: data != null && method.toUpperCase() !== 'GET' ? JSON.stringify(data) : undefined,
  })

  if (!res.ok) {
    throw new Error(`API ${method} ${path} failed: ${res.status} ${res.statusText}`)
  }

  const text = await res.text()
  return text ? JSON.parse(text) : null
}
