"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import {
  actualizarCita,
  crearCita,
  eliminarCita,
  obtenerCitas,
} from "@/services/citaService";
import { obtenerClientes } from "@/services/clienteService";
import { obtenerServicios } from "@/services/servicioService";
import { obtenerUsuarios } from "@/services/usuarioService";
import {
  cerrarSesion,
  obtenerToken,
  obtenerUsuario,
} from "@/utils/auth";

const estados = ["PENDIENTE", "CONFIRMADA", "FINALIZADA", "CANCELADA"];

const formularioInicial = {
  id_cliente: "",
  id_usuario: "",
  id_servicio: "",
  fecha_cita: "",
  hora_inicio: "",
  hora_fin: "",
  estado: "PENDIENTE",
  observaciones: "",
};

function prepararCita(formulario) {
  return {
    id_cliente: Number(formulario.id_cliente),
    id_usuario: Number(formulario.id_usuario),
    id_servicio: Number(formulario.id_servicio),
    fecha_cita: formulario.fecha_cita,
    hora_inicio: formulario.hora_inicio,
    hora_fin: formulario.hora_fin,
    estado: formulario.estado,
    observaciones: formulario.observaciones || null,
  };
}

function formatoFechaInput(fecha) {
  if (!fecha) return "";

  return String(fecha).slice(0, 10);
}

function formatoHoraInput(hora) {
  if (!hora) return "";

  return String(hora).slice(0, 5);
}

function nombreCliente(cliente) {
  return `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim();
}

function nombreUsuario(usuario) {
  return `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim();
}

export default function CitasPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [citas, setCitas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [citaEditando, setCitaEditando] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function cargarDatos() {
    setCargandoDatos(true);
    setError("");

    try {
      const [citasResp, clientesResp, usuariosResp, serviciosResp] =
        await Promise.all([
          obtenerCitas(),
          obtenerClientes(),
          obtenerUsuarios(),
          obtenerServicios(),
        ]);

      setCitas(citasResp?.data || []);
      setClientes(clientesResp?.data || []);
      setUsuarios(usuariosResp?.data || []);
      setServicios(serviciosResp?.data || []);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los datos de citas.");
    } finally {
      setCargandoDatos(false);
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
      cargarDatos();
    }, 0);

    return () => window.clearTimeout(verificarSesion);
  }, [router]);

  function handleCerrarSesion() {
    cerrarSesion();
    router.replace("/login");
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormulario((prevFormulario) => ({
      ...prevFormulario,
      [name]: value,
    }));
  }

  function limpiarFormulario() {
    setFormulario(formularioInicial);
    setCitaEditando(null);
  }

  function editarCita(cita) {
    setCitaEditando(cita);
    setFormulario({
      id_cliente: String(cita.id_cliente || ""),
      id_usuario: String(cita.id_usuario || ""),
      id_servicio: String(cita.id_servicio || ""),
      fecha_cita: formatoFechaInput(cita.fecha_cita),
      hora_inicio: formatoHoraInput(cita.hora_inicio),
      hora_fin: formatoHoraInput(cita.hora_fin),
      estado: cita.estado || "PENDIENTE",
      observaciones: cita.observaciones || "",
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
      const datosCita = prepararCita(formulario);

      if (citaEditando) {
        await actualizarCita(citaEditando.id_cita, datosCita);
        setMensaje("Cita actualizada correctamente.");
      } else {
        await crearCita(datosCita);
        setMensaje("Cita creada correctamente.");
      }

      limpiarFormulario();
      await cargarDatos();
    } catch (err) {
      setError(err.message || "No se pudo guardar la cita.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(cita) {
    const confirmar = window.confirm(`¿Eliminar la cita #${cita.id_cita}?`);

    if (!confirmar) return;

    setMensaje("");
    setError("");

    try {
      await eliminarCita(cita.id_cita);
      setMensaje("Cita eliminada correctamente.");
      await cargarDatos();
    } catch (err) {
      setError(err.message || "No se pudo eliminar la cita.");
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
          <div className="mb-4">
            <span className="badge text-bg-primary mb-2">Citas</span>
            <h1 className="h2 fw-bold mb-1">Gestión de citas</h1>
            <p className="text-secondary mb-0">
              Programa, edita y elimina citas del salón.
            </p>
          </div>

          {mensaje && (
            <div className="alert alert-success" role="alert">
              {mensaje}
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="row g-4">
            <div className="col-12 col-xl-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h2 className="h5 fw-bold mb-3">
                    {citaEditando ? "Editar cita" : "Nueva cita"}
                  </h2>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="id_cliente" className="form-label">
                        Cliente
                      </label>
                      <select
                        id="id_cliente"
                        name="id_cliente"
                        className="form-select"
                        value={formulario.id_cliente}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccionar cliente</option>
                        {clientes.map((cliente) => (
                          <option
                            value={cliente.id_cliente}
                            key={cliente.id_cliente}
                          >
                            {nombreCliente(cliente)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="id_usuario" className="form-label">
                        Usuario
                      </label>
                      <select
                        id="id_usuario"
                        name="id_usuario"
                        className="form-select"
                        value={formulario.id_usuario}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccionar usuario</option>
                        {usuarios.map((itemUsuario) => (
                          <option
                            value={itemUsuario.id_usuario}
                            key={itemUsuario.id_usuario}
                          >
                            {nombreUsuario(itemUsuario)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="id_servicio" className="form-label">
                        Servicio
                      </label>
                      <select
                        id="id_servicio"
                        name="id_servicio"
                        className="form-select"
                        value={formulario.id_servicio}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccionar servicio</option>
                        {servicios.map((servicio) => (
                          <option
                            value={servicio.id_servicio}
                            key={servicio.id_servicio}
                          >
                            {servicio.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="fecha_cita" className="form-label">
                        Fecha
                      </label>
                      <input
                        id="fecha_cita"
                        name="fecha_cita"
                        type="date"
                        className="form-control"
                        value={formulario.fecha_cita}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label htmlFor="hora_inicio" className="form-label">
                          Hora inicio
                        </label>
                        <input
                          id="hora_inicio"
                          name="hora_inicio"
                          type="time"
                          className="form-control"
                          value={formulario.hora_inicio}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label htmlFor="hora_fin" className="form-label">
                          Hora fin
                        </label>
                        <input
                          id="hora_fin"
                          name="hora_fin"
                          type="time"
                          className="form-control"
                          value={formulario.hora_fin}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3 mt-3">
                      <label htmlFor="estado" className="form-label">
                        Estado
                      </label>
                      <select
                        id="estado"
                        name="estado"
                        className="form-select"
                        value={formulario.estado}
                        onChange={handleChange}
                      >
                        {estados.map((estado) => (
                          <option value={estado} key={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="observaciones" className="form-label">
                        Observaciones
                      </label>
                      <textarea
                        id="observaciones"
                        name="observaciones"
                        className="form-control"
                        rows="3"
                        value={formulario.observaciones}
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
                          : citaEditando
                            ? "Actualizar cita"
                            : "Crear cita"}
                      </button>

                      {citaEditando && (
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
                    <h2 className="h5 fw-bold mb-0">Listado de citas</h2>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={cargarDatos}
                      disabled={cargandoDatos}
                    >
                      Actualizar
                    </button>
                  </div>

                  {cargandoDatos ? (
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
                            <th>Cliente</th>
                            <th>Servicio</th>
                            <th>Usuario</th>
                            <th>Fecha</th>
                            <th>Horario</th>
                            <th>Estado</th>
                            <th className="text-end">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {citas.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="text-center text-secondary py-4">
                                No hay citas registradas.
                              </td>
                            </tr>
                          ) : (
                            citas.map((cita) => (
                              <tr key={cita.id_cita}>
                                <td>{cita.cliente || cita.id_cliente}</td>
                                <td>{cita.servicio || cita.id_servicio}</td>
                                <td>{cita.usuario || cita.id_usuario}</td>
                                <td>{formatoFechaInput(cita.fecha_cita)}</td>
                                <td>
                                  {formatoHoraInput(cita.hora_inicio)} -{" "}
                                  {formatoHoraInput(cita.hora_fin)}
                                </td>
                                <td>
                                  <span className="badge text-bg-secondary">
                                    {cita.estado}
                                  </span>
                                </td>
                                <td>
                                  <div className="d-flex justify-content-end gap-2">
                                    <button
                                      type="button"
                                      className="btn btn-outline-primary btn-sm"
                                      onClick={() => editarCita(cita)}
                                    >
                                      Editar
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => handleEliminar(cita)}
                                    >
                                      Eliminar
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
