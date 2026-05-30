import { apiFetch } from "./api";
import { obtenerToken } from "@/utils/auth";

function getAuthHeaders() {
  const token = obtenerToken();

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function obtenerIngresos() {
  return apiFetch("/ingresos", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function obtenerIngresoPorId(id) {
  return apiFetch(`/ingresos/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function crearIngreso(ingreso) {
  return apiFetch("/ingresos", {
    method: "POST",
    headers: getAuthHeaders(),
    body: ingreso,
  });
}

export async function actualizarIngreso(id, ingreso) {
  return apiFetch(`/ingresos/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: ingreso,
  });
}

export async function eliminarIngreso(id) {
  return apiFetch(`/ingresos/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

const ingresoService = {
  obtenerIngresos,
  obtenerIngresoPorId,
  crearIngreso,
  actualizarIngreso,
  eliminarIngreso,
};

export default ingresoService;
