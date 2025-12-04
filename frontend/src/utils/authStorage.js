// Minimal wrapper to centralize token storage.
// Goal: avoid using localStorage directly for tokens.
// If possible, migrate to HttpOnly cookies on the backend later.

const TOKEN_KEY = "gp_auth_token";

export function setAuthToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    // ignore
  }
}

export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    // ignore
  }
}
