import { apiFetch } from "./api";
import { obtenerToken } from "@/utils/auth";

function getAuthHeaders() {
  const token = obtenerToken();

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function obtenerClientes() {
  return apiFetch("/clientes", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function obtenerClientePorId(id) {
  return apiFetch(`/clientes/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function crearCliente(cliente) {
  return apiFetch("/clientes", {
    method: "POST",
    headers: getAuthHeaders(),
    body: cliente,
  });
}

export async function actualizarCliente(id, cliente) {
  return apiFetch(`/clientes/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: cliente,
  });
}

export async function eliminarCliente(id) {
  return apiFetch(`/clientes/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

const clienteService = {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
};

export default clienteService;
