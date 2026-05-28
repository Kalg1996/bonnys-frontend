import { apiFetch } from "./api";

export async function login(nombre_usuario, password) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: {
      nombre_usuario,
      password,
    },
  });
}

const authService = {
  login,
};

export default authService;
