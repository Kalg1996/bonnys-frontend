"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import {
  actualizarGasto,
  crearGasto,
  eliminarGasto,
  obtenerGastos,
} from "@/services/gastoService";
import { obtenerUsuarios } from "@/services/usuarioService";
import {
  cerrarSesion,
  obtenerToken,
  obtenerUsuario,
} from "@/utils/auth";

const categorias = ["RENTA", "LUZ", "AGUA", "PRODUCTOS", "PUBLICIDAD", "OTRO"];
const metodosPago = ["EFECTIVO", "TARJETA", "TRANSFERENCIA", "OTRO"];

const formularioInicial = {
  categoria: "RENTA",
  concepto: "",
  monto: "",
  metodo_pago: "EFECTIVO",
  fecha_gasto: "",
  id_usuario: "",
  observaciones: "",
};

const formatoMoneda = new Intl.NumberFormat("es-GT", {
  style: "currency",
  currency: "GTQ",
});

function prepararGasto(formulario) {
  return {
    categoria: formulario.categoria,
    concepto: formulario.concepto,
    monto: Number(formulario.monto),
    metodo_pago: formulario.metodo_pago,
    fecha_gasto: formulario.fecha_gasto || undefined,
    id_usuario: formulario.id_usuario ? Number(formulario.id_usuario) : null,
    observaciones: formulario.observaciones || null,
  };
}

function formatoFechaInput(fecha) {
  if (!fecha) return "";

  return String(fecha).slice(0, 10);
}

function nombreUsuario(usuario) {
  return `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim();
}

export default function GastosPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [gastos, setGastos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [gastoEditando, setGastoEditando] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function cargarDatos() {
    setCargandoDatos(true);
    setError("");

    try {
      const [gastosResp, usuariosResp] = await Promise.all([
        obtenerGastos(),
        obtenerUsuarios(),
      ]);

      setGastos(gastosResp?.data || []);
      setUsuarios(usuariosResp?.data || []);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los gastos.");
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
    setGastoEditando(null);
  }

  function editarGasto(gasto) {
    setGastoEditando(gasto);
    setFormulario({
      categoria: gasto.categoria || "RENTA",
      concepto: gasto.concepto || "",
      monto: gasto.monto ?? "",
      metodo_pago: gasto.metodo_pago || "EFECTIVO",
      fecha_gasto: formatoFechaInput(gasto.fecha_gasto),
      id_usuario: gasto.id_usuario ? String(gasto.id_usuario) : "",
      observaciones: gasto.observaciones || "",
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
      const datosGasto = prepararGasto(formulario);

      if (gastoEditando) {
        await actualizarGasto(gastoEditando.id_gasto, datosGasto);
        setMensaje("Gasto actualizado correctamente.");
      } else {
        await crearGasto(datosGasto);
        setMensaje("Gasto creado correctamente.");
      }

      limpiarFormulario();
      await cargarDatos();
    } catch (err) {
      setError(err.message || "No se pudo guardar el gasto.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(gasto) {
    const confirmar = window.confirm(`¿Eliminar el gasto "${gasto.concepto}"?`);

    if (!confirmar) return;

    setMensaje("");
    setError("");

    try {
      await eliminarGasto(gasto.id_gasto);
      setMensaje("Gasto eliminado correctamente.");
      await cargarDatos();
    } catch (err) {
      setError(err.message || "No se pudo eliminar el gasto.");
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
            <span className="badge text-bg-primary mb-2">Gastos</span>
            <h1 className="h2 fw-bold mb-1">Gestión de gastos</h1>
            <p className="text-secondary mb-0">
              Registra y administra gastos del salón.
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
                    {gastoEditando ? "Editar gasto" : "Nuevo gasto"}
                  </h2>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="categoria" className="form-label">
                        Categoría
                      </label>
                      <select
                        id="categoria"
                        name="categoria"
                        className="form-select"
                        value={formulario.categoria}
                        onChange={handleChange}
                      >
                        {categorias.map((categoria) => (
                          <option value={categoria} key={categoria}>
                            {categoria}
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
                        type="number"
                        min="0"
                        step="0.01"
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
                      <label htmlFor="fecha_gasto" className="form-label">
                        Fecha de gasto
                      </label>
                      <input
                        id="fecha_gasto"
                        name="fecha_gasto"
                        type="date"
                        className="form-control"
                        value={formulario.fecha_gasto}
                        onChange={handleChange}
                      />
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
                          : gastoEditando
                            ? "Actualizar gasto"
                            : "Crear gasto"}
                      </button>

                      {gastoEditando && (
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
                    <h2 className="h5 fw-bold mb-0">Listado de gastos</h2>
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
                            <th>Categoría</th>
                            <th>Monto</th>
                            <th>Método</th>
                            <th>Fecha</th>
                            <th>Usuario</th>
                            <th className="text-end">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gastos.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="text-center text-secondary py-4">
                                No hay gastos registrados.
                              </td>
                            </tr>
                          ) : (
                            gastos.map((gasto) => (
                              <tr key={gasto.id_gasto}>
                                <td>
                                  <div className="fw-semibold">
                                    {gasto.concepto}
                                  </div>
                                  {gasto.observaciones && (
                                    <small className="text-secondary">
                                      {gasto.observaciones}
                                    </small>
                                  )}
                                </td>
                                <td>{gasto.categoria}</td>
                                <td>{formatoMoneda.format(Number(gasto.monto))}</td>
                                <td>{gasto.metodo_pago}</td>
                                <td>{formatoFechaInput(gasto.fecha_gasto)}</td>
                                <td>{gasto.usuario || "-"}</td>
                                <td>
                                  <div className="d-flex justify-content-end gap-2">
                                    <button
                                      type="button"
                                      className="btn btn-accent btn-sm"
                                      onClick={() => editarGasto(gasto)}
                                    >
                                      Editar
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => handleEliminar(gasto)}
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
