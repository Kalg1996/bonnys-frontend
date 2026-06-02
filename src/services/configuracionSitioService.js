import { apiFetch } from "./api";
import { obtenerToken } from "@/utils/auth";

export const CONFIGURACION_DEFAULT = {
  nombre_negocio: "Bonnys",
  logo_url: "",
  portada_url: "",
  favicon_url: "",
  color_principal: "#B91C1C",
  color_secundario: "#7F1D1D",
  color_acento: "#D97706",
  telefono_principal: "",
  telefono_secundario: "",
  correo_contacto: "",
  facebook_url: "",
  instagram_url: "",
  tiktok_url: "",
  youtube_url: "",
  whatsapp_numero: "50200000000",
  whatsapp_mensaje_predeterminado:
    "Hola, quiero más información sobre los servicios de Bonnys",
  direccion: "Bonnys Beauty Studio, Guatemala",
  google_maps_url: "",
  titulo_portada: "Bonnys",
  subtitulo_portada: "Sistema web para salón de belleza",
  meta_title: "Bonnys",
  meta_description: "Sistema web para salón de belleza",
};

function getAuthHeaders() {
  const token = obtenerToken();

  return {
    Authorization: `Bearer ${token}`,
  };
}

export function mezclarConfiguracion(configuracion) {
  return {
    ...CONFIGURACION_DEFAULT,
    ...(configuracion || {}),
  };
}

export function getThemeStyle(configuracion) {
  const config = mezclarConfiguracion(configuracion);

  return {
    "--bonnys-red": config.color_principal,
    "--bonnys-red-dark": config.color_secundario,
    "--bonnys-gold": config.color_acento,
  };
}

export async function obtenerConfiguracionPublica() {
  return apiFetch("/public/configuracion-sitio", {
    method: "GET",
  });
}

export async function obtenerConfiguracionAdmin() {
  return apiFetch("/configuracion-sitio", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function actualizarConfiguracionSitio(configuracion) {
  return apiFetch("/configuracion-sitio", {
    method: "PUT",
    headers: getAuthHeaders(),
    body: configuracion,
  });
}

const configuracionSitioService = {
  obtenerConfiguracionPublica,
  obtenerConfiguracionAdmin,
  actualizarConfiguracionSitio,
};

export default configuracionSitioService;
