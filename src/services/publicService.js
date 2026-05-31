import { apiFetch } from "./api";

export async function obtenerServiciosPublicos() {
  return apiFetch("/public/servicios", {
    method: "GET",
  });
}

export async function obtenerProductosPublicos() {
  return apiFetch("/public/productos", {
    method: "GET",
  });
}

export async function agendarCitaPublica(datos) {
  return apiFetch("/public/citas", {
    method: "POST",
    body: datos,
  });
}

const publicService = {
  obtenerServiciosPublicos,
  obtenerProductosPublicos,
  agendarCitaPublica,
};

export default publicService;
