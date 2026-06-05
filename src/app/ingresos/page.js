"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AlertMessage from "@/components/AlertMessage";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { obtenerClientes } from "@/services/clienteService";
import {
  actualizarIngreso,
  crearIngreso,
  eliminarIngreso,
  obtenerIngresos,
} from "@/services/ingresoService";
import { obtenerUsuarios } from "@/services/usuarioService";
import {
  cerrarSesion,
  obtenerToken,
  obtenerUsuario,
} from "@/utils/auth";
import { normalizarCampoNumerico } from "@/utils/numberInput";

const tiposIngreso = ["SERVICIO", "PRODUCTO", "OTRO"];
const metodosPago = ["EFECTIVO", "TARJETA", "TRANSFERENCIA", "OTRO"];

const formularioInicial = {
  tipo_ingreso: "SERVICIO",
  concepto: "",
  monto: "",
  metodo_pago: "EFECTIVO",
  fecha_ingreso: "",
  id_cliente: "",
  id_usuario: "",
  observaciones: "",
};

const formatoMoneda = new Intl.NumberFormat("es-GT", {
  style: "currency",
  currency: "GTQ",
});

function prepararIngreso(formulario) {
  return {
    tipo_ingreso: formulario.tipo_ingreso,
    concepto: formulario.concepto,
    monto: Number(formulario.monto),
    metodo_pago: formulario.metodo_pago,
    fecha_ingreso: formulario.fecha_ingreso || undefined,
    id_cliente: formulario.id_cliente ? Number(formulario.id_cliente) : null,
    id_usuario: formulario.id_usuario ? Number(formulario.id_usuario) : null,
    observaciones: formulario.observaciones || null,
  };
}

function formatoFechaInput(fecha) {
  if (!fecha) return "";

  return String(fecha).slice(0, 10);
}

function nombreCliente(cliente) {
  return `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim();
}

function nombreUsuario(usuario) {
  return `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim();
}

export default function IngresosPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [ingresos, setIngresos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [ingresoEditando, setIngresoEditando] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function cargarDatos() {
    setCargandoDatos(true);
    setError("");

    try {
      const [ingresosResp, clientesResp, usuariosResp] = await Promise.all([
        obtenerIngresos(),
        obtenerClientes(),
        obtenerUsuarios(),
      ]);

      setIngresos(ingresosResp?.data || []);
      setClientes(clientesResp?.data || []);
      setUsuarios(usuariosResp?.data || []);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los ingresos.");
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
    const valor = normalizarCampoNumerico(name, value, {
      decimales: ["monto"],
    });

    setFormulario((prevFormulario) => ({
      ...prevFormulario,
      [name]: valor,
    }));
  }

  function limpiarFormulario() {
    setFormulario(formularioInicial);
    setIngresoEditando(null);
  }

  function editarIngreso(ingreso) {
    setIngresoEditando(ingreso);
    setFormulario({
      tipo_ingreso: ingreso.tipo_ingreso || "SERVICIO",
      concepto: ingreso.concepto || "",
      monto: ingreso.monto ?? "",
      metodo_pago: ingreso.metodo_pago || "EFECTIVO",
      fecha_ingreso: formatoFechaInput(ingreso.fecha_ingreso),
      id_cliente: ingreso.id_cliente ? String(ingreso.id_cliente) : "",
      id_usuario: ingreso.id_usuario ? String(ingreso.id_usuario) : "",
      observaciones: ingreso.observaciones || "",
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
      const datosIngreso = prepararIngreso(formulario);

      if (ingresoEditando) {
        await actualizarIngreso(ingresoEditando.id_ingreso, datosIngreso);
        setMensaje("Ingreso actualizado correctamente.");
      } else {
        await crearIngreso(datosIngreso);
        setMensaje("Ingreso creado correctamente.");
      }

      limpiarFormulario();
      await cargarDatos();
    } catch (err) {
      setError(err.message || "No se pudo guardar el ingreso.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(ingreso) {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este registro? Esta acción no se puede deshacer."
    );

    if (!confirmar) return;

    setEliminandoId(ingreso.id_ingreso);
    setMensaje("");
    setError("");

    try {
      await eliminarIngreso(ingreso.id_ingreso);
      setMensaje("Ingreso eliminado correctamente.");
      await cargarDatos();
    } catch (err) {
      setError(err.message || "No se pudo eliminar el ingreso.");
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
          <div className="mb-4">
            <span className="badge text-bg-primary mb-2">Ingresos</span>
            <h1 className="h2 fw-bold mb-1">Gestión de ingresos</h1>
            <p className="text-secondary mb-0">
              Registra y administra ingresos del salón.
            </p>
          </div>

          <AlertMessage type="success" message={mensaje} />
          <AlertMessage type="danger" message={error} />

          <div className="row g-4">
            <div className="col-12 col-xl-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h2 className="h5 fw-bold mb-3">
                    {ingresoEditando ? "Editar ingreso" : "Nuevo ingreso"}
                  </h2>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="tipo_ingreso" className="form-label">
                        Tipo de ingreso
                      </label>
                      <select
                        id="tipo_ingreso"
                        name="tipo_ingreso"
                        className="form-select"
                        value={formulario.tipo_ingreso}
                        onChange={handleChange}
                      >
                        {tiposIngreso.map((tipo) => (
                          <option value={tipo} key={tipo}>
                            {tipo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="concepto" className="form-label">
                        Concepto
                      </label>
                      <input
                        id="concepto"
                        name="concepto"
                        type="text"
                        className="form-control"
                        value={formulario.concepto}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="monto" className="form-label">
                        Monto
                      </label>
                      <input
                        id="monto"
                        name="monto"
                        type="text"
                        inputMode="decimal"
                        className="form-control"
                        value={formulario.monto}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="metodo_pago" className="form-label">
                        Método de pago
                      </label>
                      <select
                        id="metodo_pago"
                        name="metodo_pago"
                        className="form-select"
                        value={formulario.metodo_pago}
                        onChange={handleChange}
                      >
                        {metodosPago.map((metodo) => (
                          <option value={metodo} key={metodo}>
                            {metodo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="fecha_ingreso" className="form-label">
                        Fecha de ingreso
                      </label>
                      <input
                        id="fecha_ingreso"
                        name="fecha_ingreso"
                        type="date"
                        className="form-control"
                        value={formulario.fecha_ingreso}
                        onChange={handleChange}
                      />
                    </div>

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
                      >
                        <option value="">Sin cliente</option>
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
                      >
                        <option value="">Sin usuario</option>
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
                          : ingresoEditando
                            ? "Actualizar ingreso"
                            : "Crear ingreso"}
                      </button>

                      {ingresoEditando && (
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
                    <h2 className="h5 fw-bold mb-0">Listado de ingresos</h2>
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
                            <th>Concepto</th>
                            <th>Tipo</th>
                            <th>Monto</th>
                            <th>Método</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Usuario</th>
                            <th className="text-end">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ingresos.length === 0 ? (
                            <tr>
                              <td colSpan="8" className="text-center text-secondary py-4">
                                No hay ingresos registrados.
                              </td>
                            </tr>
                          ) : (
                            ingresos.map((ingreso) => (
                              <tr key={ingreso.id_ingreso}>
                                <td>
                                  <div className="fw-semibold">
                                    {ingreso.concepto}
                                  </div>
                                  {ingreso.observaciones && (
                                    <small className="text-secondary">
                                      {ingreso.observaciones}
                                    </small>
                                  )}
                                </td>
                                <td>{ingreso.tipo_ingreso}</td>
                                <td>{formatoMoneda.format(Number(ingreso.monto))}</td>
                                <td>{ingreso.metodo_pago}</td>
                                <td>{formatoFechaInput(ingreso.fecha_ingreso)}</td>
                                <td>{ingreso.cliente || "-"}</td>
                                <td>{ingreso.usuario || "-"}</td>
                                <td>
                                  <div className="d-flex justify-content-end gap-2">
                                    <button
                                      type="button"
                                      className="btn btn-accent btn-sm"
                                      onClick={() => editarIngreso(ingreso)}
                                    >
                                      Editar
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => handleEliminar(ingreso)}
                                      disabled={eliminandoId === ingreso.id_ingreso}
                                    >
                                      {eliminandoId === ingreso.id_ingreso
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
