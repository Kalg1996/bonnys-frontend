import { apiFetch } from "./api";
import { obtenerToken } from "@/utils/auth";

function getAuthHeaders() {
  return {
    Authorization: `Bearer ${obtenerToken()}`,
  };
}

export async function obtenerResumenAlmacenamiento() {
  return apiFetch("/almacenamiento/resumen", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function obtenerArchivosNoUsados() {
  return apiFetch("/almacenamiento/archivos-no-usados", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function eliminarArchivosNoUsados() {
  return apiFetch("/almacenamiento/archivos-no-usados", {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

const almacenamientoService = {
  obtenerResumenAlmacenamiento,
  obtenerArchivosNoUsados,
  eliminarArchivosNoUsados,
};

export default almacenamientoService;
