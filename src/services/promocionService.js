import { apiFetch } from "./api";
import { obtenerToken } from "@/utils/auth";

function getAuthHeaders() {
  return {
    Authorization: `Bearer ${obtenerToken()}`,
  };
}

export async function obtenerPromociones() {
  return apiFetch("/promociones", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function obtenerPromocionPorId(id) {
  return apiFetch(`/promociones/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function crearPromocion(data) {
  return apiFetch("/promociones", {
    method: "POST",
    headers: getAuthHeaders(),
    body: data,
  });
}

export async function actualizarPromocion(id, data) {
  return apiFetch(`/promociones/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: data,
  });
}

export async function eliminarPromocion(id) {
  return apiFetch(`/promociones/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

const promocionService = {
  obtenerPromociones,
  obtenerPromocionPorId,
  crearPromocion,
  actualizarPromocion,
  eliminarPromocion,
};

export default promocionService;
