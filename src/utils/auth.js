const TOKEN_KEY = 'token'

export function getToken() {
  return window.sessionStorage.getItem(TOKEN_KEY) || ''
}

export function setToken(token) {
  window.sessionStorage.setItem(TOKEN_KEY, token)
}

export function removeToken() {
  window.sessionStorage.removeItem(TOKEN_KEY)
}
