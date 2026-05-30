import { apiFetch } from "./api";
import { obtenerToken } from "@/utils/auth";

function getAuthHeaders() {
  const token = obtenerToken();

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function obtenerCitas() {
  return apiFetch("/citas", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function obtenerCitaPorId(id) {
  return apiFetch(`/citas/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function crearCita(cita) {
  return apiFetch("/citas", {
    method: "POST",
    headers: getAuthHeaders(),
    body: cita,
  });
}

export async function actualizarCita(id, cita) {
  return apiFetch(`/citas/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: cita,
  });
}

export async function eliminarCita(id) {
  return apiFetch(`/citas/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

const citaService = {
  obtenerCitas,
  obtenerCitaPorId,
  crearCita,
  actualizarCita,
  eliminarCita,
};

export default citaService;
