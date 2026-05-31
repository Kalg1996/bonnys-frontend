import { apiFetch } from "./api";
import { obtenerToken } from "@/utils/auth";

function getAuthHeaders() {
  const token = obtenerToken();

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function obtenerGastos() {
  return apiFetch("/gastos", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function obtenerGastoPorId(id) {
  return apiFetch(`/gastos/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function crearGasto(gasto) {
  return apiFetch("/gastos", {
    method: "POST",
    headers: getAuthHeaders(),
    body: gasto,
  });
}

export async function actualizarGasto(id, gasto) {
  return apiFetch(`/gastos/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: gasto,
  });
}

export async function eliminarGasto(id) {
  return apiFetch(`/gastos/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

const gastoService = {
  obtenerGastos,
  obtenerGastoPorId,
  crearGasto,
  actualizarGasto,
  eliminarGasto,
};

export default gastoService;
