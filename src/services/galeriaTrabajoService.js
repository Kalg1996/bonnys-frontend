import { apiFetch } from "./api";
import { obtenerToken } from "@/utils/auth";

function getAuthHeaders() {
  return {
    Authorization: `Bearer ${obtenerToken()}`,
  };
}

export async function obtenerGaleriaTrabajos() {
  return apiFetch("/galeria-trabajos", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function obtenerGaleriaTrabajoPorId(id) {
  return apiFetch(`/galeria-trabajos/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function crearGaleriaTrabajo(data) {
  return apiFetch("/galeria-trabajos", {
    method: "POST",
    headers: getAuthHeaders(),
    body: data,
  });
}

export async function actualizarGaleriaTrabajo(id, data) {
  return apiFetch(`/galeria-trabajos/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: data,
  });
}

export async function eliminarGaleriaTrabajo(id) {
  return apiFetch(`/galeria-trabajos/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

const galeriaTrabajoService = {
  obtenerGaleriaTrabajos,
  obtenerGaleriaTrabajoPorId,
  crearGaleriaTrabajo,
  actualizarGaleriaTrabajo,
  eliminarGaleriaTrabajo,
};

export default galeriaTrabajoService;
