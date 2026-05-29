import { apiFetch } from "./api";
import { obtenerToken } from "@/utils/auth";

function getAuthHeaders() {
  const token = obtenerToken();

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function obtenerServicios() {
  return apiFetch("/servicios", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function obtenerServicioPorId(id) {
  return apiFetch(`/servicios/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function crearServicio(servicio) {
  return apiFetch("/servicios", {
    method: "POST",
    headers: getAuthHeaders(),
    body: servicio,
  });
}

export async function actualizarServicio(id, servicio) {
  return apiFetch(`/servicios/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: servicio,
  });
}

export async function eliminarServicio(id) {
  return apiFetch(`/servicios/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

const servicioService = {
  obtenerServicios,
  obtenerServicioPorId,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
};

export default servicioService;
