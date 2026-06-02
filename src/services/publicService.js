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

export async function obtenerDisponibilidad(fecha, idServicio) {
  const params = new URLSearchParams({
    fecha,
    id_servicio: String(idServicio),
  });

  return apiFetch(`/public/disponibilidad?${params.toString()}`, {
    method: "GET",
  });
}

export async function obtenerTestimoniosPublicos() {
  return apiFetch("/public/testimonios", {
    method: "GET",
  });
}

export async function obtenerPromocionesPublicas() {
  return apiFetch("/public/promociones", {
    method: "GET",
  });
}

export async function obtenerGaleriaTrabajosPublica() {
  return apiFetch("/public/galeria-trabajos", {
    method: "GET",
  });
}

const publicService = {
  obtenerServiciosPublicos,
  obtenerProductosPublicos,
  agendarCitaPublica,
  obtenerDisponibilidad,
  obtenerTestimoniosPublicos,
  obtenerPromocionesPublicas,
  obtenerGaleriaTrabajosPublica,
};

export default publicService;
