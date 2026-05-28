const TOKEN_KEY = "bonnys_token";
const USUARIO_KEY = "bonnys_usuario";

function storageDisponible() {
  return typeof window !== "undefined" && window.localStorage;
}

export function guardarToken(token) {
  if (!storageDisponible()) return;

  localStorage.setItem(TOKEN_KEY, token);
}

export function obtenerToken() {
  if (!storageDisponible()) return null;

  return localStorage.getItem(TOKEN_KEY);
}

export function eliminarToken() {
  if (!storageDisponible()) return;

  localStorage.removeItem(TOKEN_KEY);
}

export function guardarUsuario(usuario) {
  if (!storageDisponible()) return;

  localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
}

export function obtenerUsuario() {
  if (!storageDisponible()) return null;

  const usuario = localStorage.getItem(USUARIO_KEY);

  return usuario ? JSON.parse(usuario) : null;
}

export function eliminarUsuario() {
  if (!storageDisponible()) return;

  localStorage.removeItem(USUARIO_KEY);
}

export function cerrarSesion() {
  eliminarToken();
  eliminarUsuario();
}
