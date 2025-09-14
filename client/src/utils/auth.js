// frontend/src/utils/auth.js
export function saveToken(token) {
  localStorage.setItem("gfe_token", token);
}
export function getToken() {
  return localStorage.getItem("gfe_token");
}
export function clearToken() {
  localStorage.removeItem("gfe_token");
}

