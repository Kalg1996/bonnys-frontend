import { apiFetch } from "./api";
import { obtenerToken } from "@/utils/auth";

function getAuthHeaders() {
  const token = obtenerToken();

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function obtenerUsuarios() {
  return apiFetch("/usuarios", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

const usuarioService = {
  obtenerUsuarios,
};

export default usuarioService;
