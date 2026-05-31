import { apiFetch } from "./api";
import { obtenerToken } from "@/utils/auth";

function getAuthHeaders() {
  const token = obtenerToken();

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function obtenerHorariosSalon() {
  return apiFetch("/horarios-salon", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function obtenerHorarioSalonPorId(id) {
  return apiFetch(`/horarios-salon/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function actualizarHorarioSalon(id, horario) {
  return apiFetch(`/horarios-salon/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: horario,
  });
}

const horarioSalonService = {
  obtenerHorariosSalon,
  obtenerHorarioSalonPorId,
  actualizarHorarioSalon,
};

export default horarioSalonService;
