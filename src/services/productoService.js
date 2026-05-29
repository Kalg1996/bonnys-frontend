import { apiFetch } from "./api";
import { obtenerToken } from "@/utils/auth";

function getAuthHeaders() {
  const token = obtenerToken();

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function obtenerProductos() {
  return apiFetch("/productos", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function obtenerProductoPorId(id) {
  return apiFetch(`/productos/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function crearProducto(producto) {
  return apiFetch("/productos", {
    method: "POST",
    headers: getAuthHeaders(),
    body: producto,
  });
}

export async function actualizarProducto(id, producto) {
  return apiFetch(`/productos/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: producto,
  });
}

export async function eliminarProducto(id) {
  return apiFetch(`/productos/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

const productoService = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};

export default productoService;
