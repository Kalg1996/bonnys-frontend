import { apiFetch } from "./api";
import { obtenerToken } from "@/utils/auth";

function getAuthHeaders() {
  return {
    Authorization: `Bearer ${obtenerToken()}`,
  };
}

export async function obtenerTestimonios() {
  return apiFetch("/testimonios", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function obtenerTestimonioPorId(id) {
  return apiFetch(`/testimonios/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function crearTestimonio(data) {
  return apiFetch("/testimonios", {
    method: "POST",
    headers: getAuthHeaders(),
    body: data,
  });
}

export async function actualizarTestimonio(id, data) {
  return apiFetch(`/testimonios/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: data,
  });
}

export async function eliminarTestimonio(id) {
  return apiFetch(`/testimonios/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

const testimonioService = {
  obtenerTestimonios,
  obtenerTestimonioPorId,
  crearTestimonio,
  actualizarTestimonio,
  eliminarTestimonio,
};

export default testimonioService;
