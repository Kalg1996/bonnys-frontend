"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AlertMessage from "@/components/AlertMessage";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import {
  actualizarCliente,
  crearCliente,
  eliminarCliente,
  obtenerClientes,
} from "@/services/clienteService";
import {
  cerrarSesion,
  obtenerToken,
  obtenerUsuario,
} from "@/utils/auth";
import { normalizarCampoNumerico } from "@/utils/numberInput";

const formularioInicial = {
  nombre: "",
  apellido: "",
  telefono1: "",
  telefono2: "",
  correo: "",
  direccion: "",
};

export default function ClientesPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function cargarClientes() {
    setCargandoClientes(true);
    setError("");

    try {
      const respuesta = await obtenerClientes();
      setClientes(respuesta?.data || []);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los clientes.");
    } finally {
      setCargandoClientes(false);
    }
  }

  useEffect(() => {
    const verificarSesion = window.setTimeout(() => {
      const token = obtenerToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      setUsuario(obtenerUsuario());
      setCargandoSesion(false);
      cargarClientes();
    }, 0);

    return () => window.clearTimeout(verificarSesion);
  }, [router]);

  function handleCerrarSesion() {
    cerrarSesion();
    router.replace("/login");
  }

  function handleChange(event) {
    const { name, value } = event.target;
    const valor = normalizarCampoNumerico(name, value, {
      telefonos: ["telefono1", "telefono2"],
    });

    setFormulario((prevFormulario) => ({
      ...prevFormulario,
      [name]: valor,
    }));
  }

  function limpiarFormulario() {
    setFormulario(formularioInicial);
    setClienteEditando(null);
  }

  function editarCliente(cliente) {
    setClienteEditando(cliente);
    setFormulario({
      nombre: cliente.nombre || "",
      apellido: cliente.apellido || "",
      telefono1: cliente.telefono1 || "",
      telefono2: cliente.telefono2 || "",
      correo: cliente.correo || "",
      direccion: cliente.direccion || "",
    });
    setMensaje("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setGuardando(true);
    setMensaje("");
    setError("");

    try {
      if (clienteEditando) {
        await actualizarCliente(clienteEditando.id_cliente, formulario);
        setMensaje("Cliente actualizado correctamente.");
      } else {
        await crearCliente(formulario);
        setMensaje("Cliente creado correctamente.");
      }

      limpiarFormulario();
      await cargarClientes();
    } catch (err) {
      setError(err.message || "No se pudo guardar el cliente.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(cliente) {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este registro? Esta acción no se puede deshacer."
    );

    if (!confirmar) return;

    setEliminandoId(cliente.id_cliente);
    setMensaje("");
    setError("");

    try {
      await eliminarCliente(cliente.id_cliente);
      setMensaje("Cliente eliminado correctamente.");
      await cargarClientes();
    } catch (err) {
      setError(err.message || "No se pudo eliminar el cliente.");
    } finally {
      setEliminandoId(null);
    }
  }

  if (cargandoSesion) {
    return (
      <main className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-vh-100 bg-light">
      <Navbar usuario={usuario} onCerrarSesion={handleCerrarSesion} />

      <div className="dashboard-shell">
        <Sidebar />

        <section className="dashboard-content p-3 p-md-4 p-xl-5">
          <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
            <div>
              <span className="badge text-bg-primary mb-2">Clientes</span>
              <h1 className="h2 fw-bold mb-1">Gestión de clientes</h1>
              <p className="text-secondary mb-0">
                Crea, edita y elimina clientes del salón.
              </p>
            </div>
          </div>

          <AlertMessage type="success" message={mensaje} />
          <AlertMessage type="danger" message={error} />

          <div className="row g-4">
            <div className="col-12 col-xl-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h2 className="h5 fw-bold mb-3">
                    {clienteEditando ? "Editar cliente" : "Nuevo cliente"}
                  </h2>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="nombre" className="form-label">
                        Nombre
                      </label>
                      <input
                        id="nombre"
                        name="nombre"
                        type="text"
                        className="form-control"
                        value={formulario.nombre}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="apellido" className="form-label">
                        Apellido
                      </label>
                      <input
                        id="apellido"
                        name="apellido"
                        type="text"
                        className="form-control"
                        value={formulario.apellido}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="telefono1" className="form-label">
                        Teléfono 1
                      </label>
                      <input
                        id="telefono1"
                        name="telefono1"
                        type="text"
                        inputMode="numeric"
                        className="form-control"
                        value={formulario.telefono1}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="telefono2" className="form-label">
                        Teléfono 2
                      </label>
                      <input
                        id="telefono2"
                        name="telefono2"
                        type="text"
                        inputMode="numeric"
                        className="form-control"
                        value={formulario.telefono2}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="correo" className="form-label">
                        Correo
                      </label>
                      <input
                        id="correo"
                        name="correo"
                        type="email"
                        className="form-control"
                        value={formulario.correo}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="direccion" className="form-label">
                        Dirección
                      </label>
                      <textarea
                        id="direccion"
                        name="direccion"
                        className="form-control"
                        rows="3"
                        value={formulario.direccion}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="d-grid gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={guardando}
                      >
                        {guardando
                          ? "Guardando..."
                          : clienteEditando
                            ? "Actualizar cliente"
                            : "Crear cliente"}
                      </button>

                      {clienteEditando && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={limpiarFormulario}
                          disabled={guardando}
                        >
                          Cancelar edición
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-12 col-xl-8">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                  <div className="d-flex align-items-center justify-content-between gap-3 p-4 border-bottom">
                    <h2 className="h5 fw-bold mb-0">Listado de clientes</h2>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={cargarClientes}
                      disabled={cargandoClientes}
                    >
                      Actualizar
                    </button>
                  </div>

                  {cargandoClientes ? (
                    <div className="p-5 text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Nombre</th>
                            <th>Teléfono</th>
                            <th>Correo</th>
                            <th>Dirección</th>
                            <th className="text-end">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clientes.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="text-center text-secondary py-4">
                                No hay clientes registrados.
                              </td>
                            </tr>
                          ) : (
                            clientes.map((cliente) => (
                              <tr key={cliente.id_cliente}>
                                <td>
                                  <div className="fw-semibold">
                                    {cliente.nombre} {cliente.apellido}
                                  </div>
                                </td>
                                <td>
                                  <div>{cliente.telefono1 || "-"}</div>
                                  {cliente.telefono2 && (
                                    <small className="text-secondary">
                                      {cliente.telefono2}
                                    </small>
                                  )}
                                </td>
                                <td>{cliente.correo || "-"}</td>
                                <td>{cliente.direccion || "-"}</td>
                                <td>
                                  <div className="d-flex justify-content-end gap-2">
                                    <button
                                      type="button"
                                      className="btn btn-accent btn-sm"
                                      onClick={() => editarCliente(cliente)}
                                    >
                                      Editar
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => handleEliminar(cliente)}
                                      disabled={eliminandoId === cliente.id_cliente}
                                    >
                                      {eliminandoId === cliente.id_cliente
                                        ? "Eliminando..."
                                        : "Eliminar"}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
