import { apiFetch } from "./api";
import { obtenerToken } from "@/utils/auth";

function getAuthHeaders() {
  const token = obtenerToken();

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function obtenerGaleriaServicio(idServicio) {
  return apiFetch(`/galerias/servicios/${idServicio}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function agregarMediaServicio(idServicio, media) {
  return apiFetch(`/galerias/servicios/${idServicio}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: media,
  });
}

export async function eliminarMediaServicio(idMedia) {
  return apiFetch(`/galerias/servicios/${idMedia}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

export async function obtenerGaleriaProducto(idProducto) {
  return apiFetch(`/galerias/productos/${idProducto}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function agregarMediaProducto(idProducto, media) {
  return apiFetch(`/galerias/productos/${idProducto}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: media,
  });
}

export async function eliminarMediaProducto(idMedia) {
  return apiFetch(`/galerias/productos/${idMedia}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

export async function obtenerGaleriaPublicaServicio(idServicio) {
  return apiFetch(`/public/servicios/${idServicio}/galeria`, {
    method: "GET",
  });
}

export async function obtenerGaleriaPublicaProducto(idProducto) {
  return apiFetch(`/public/productos/${idProducto}/galeria`, {
    method: "GET",
  });
}

const galeriaService = {
  obtenerGaleriaServicio,
  agregarMediaServicio,
  eliminarMediaServicio,
  obtenerGaleriaProducto,
  agregarMediaProducto,
  eliminarMediaProducto,
  obtenerGaleriaPublicaServicio,
  obtenerGaleriaPublicaProducto,
};

export default galeriaService;
