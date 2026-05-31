import { apiFetch } from "./api";
import { obtenerToken } from "@/utils/auth";

function getAuthHeaders() {
  const token = obtenerToken();

  return {
    Authorization: `Bearer ${token}`,
  };
}

async function subirArchivo(path, file) {
  const formData = new FormData();
  formData.append("archivo", file);

  return apiFetch(path, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });
}

export async function subirImagenProducto(file) {
  return subirArchivo("/uploads/productos/imagen", file);
}

export async function subirVideoProducto(file) {
  return subirArchivo("/uploads/productos/video", file);
}

export async function subirImagenServicio(file) {
  return subirArchivo("/uploads/servicios/imagen", file);
}

export async function subirVideoServicio(file) {
  return subirArchivo("/uploads/servicios/video", file);
}

const uploadService = {
  subirImagenProducto,
  subirVideoProducto,
  subirImagenServicio,
  subirVideoServicio,
};

export default uploadService;
