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

const publicService = {
  obtenerServiciosPublicos,
  obtenerProductosPublicos,
  agendarCitaPublica,
  obtenerDisponibilidad,
};

export default publicService;
