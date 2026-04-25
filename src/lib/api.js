const API_BASE = 'http://localhost:8080'
const TOKEN_KEY = 'token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (!token) return
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function withAuthHeaders(headers = {}) {
  const token = getToken()
  if (!token) return headers
  if (headers.Authorization) return headers
  return { ...headers, Authorization: `Bearer ${token}` }
}

export async function apiFetch(path, options = {}) {
  const { skipAuth, headers: headersInput, ...fetchOptions } = options
  const url = path.startsWith('http')
    ? path
    : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`
  const headers = skipAuth ? (headersInput ?? {}) : withAuthHeaders(headersInput ?? {})
  const hadAuthHeader = Boolean(headers.Authorization)

  const res = await fetch(url, { ...fetchOptions, headers })
  const contentType = res.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await res.json().catch(() => null)
    : await res.text().catch(() => '')

  if (!skipAuth && hadAuthHeader && (res.status === 401 || res.status === 403)) {
    clearToken()
  }

  return { res, data }
}
