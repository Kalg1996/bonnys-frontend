"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AlertMessage from "@/components/AlertMessage";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { buildAssetUrl } from "@/services/api";
import {
  actualizarTestimonio,
  crearTestimonio,
  eliminarTestimonio,
  obtenerTestimonios,
} from "@/services/testimonioService";
import { subirFotoTestimonio } from "@/services/uploadService";
import { cerrarSesion, obtenerToken, obtenerUsuario } from "@/utils/auth";
import { normalizarCampoNumerico } from "@/utils/numberInput";

const formularioInicial = {
  nombre_cliente: "",
  comentario: "",
  calificacion: 5,
  url_foto: "",
  estado: true,
};

export default function TestimoniosPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [editando, setEditando] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function cargarRegistros() {
    setCargando(true);
    setError("");

    try {
      const respuesta = await obtenerTestimonios();
      setRegistros(respuesta?.data || []);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los testimonios.");
    } finally {
      setCargando(false);
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
      cargarRegistros();
    }, 0);

    return () => window.clearTimeout(verificarSesion);
  }, [router]);

  function handleChange(event) {
    const { name, type, checked, value } = event.target;
    const valor = normalizarCampoNumerico(name, value, {
      enteros: ["calificacion"],
    });

    setFormulario((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : valor,
    }));
  }

  function limpiarFormulario() {
    setFormulario(formularioInicial);
    setEditando(null);
  }

  function editar(registro) {
    setEditando(registro);
    setFormulario({
      nombre_cliente: registro.nombre_cliente || "",
      comentario: registro.comentario || "",
      calificacion: registro.calificacion || 5,
      url_foto: registro.url_foto || "",
      estado: Boolean(registro.estado),
    });
    setMensaje("");
    setError("");
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSubiendo(true);
    setError("");

    try {
      const respuesta = await subirFotoTestimonio(file);
      setFormulario((prev) => ({
        ...prev,
        url_foto: respuesta?.data?.url || "",
      }));
      setMensaje("Foto subida correctamente.");
    } catch (err) {
      setError(err.message || "No se pudo subir la foto.");
    } finally {
      setSubiendo(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setGuardando(true);
    setMensaje("");
    setError("");

    try {
      if (editando) {
        await actualizarTestimonio(editando.id_testimonio, formulario);
        setMensaje("Testimonio actualizado correctamente.");
      } else {
        await crearTestimonio(formulario);
        setMensaje("Testimonio creado correctamente.");
      }

      limpiarFormulario();
      await cargarRegistros();
    } catch (err) {
      setError(err.message || "No se pudo guardar el testimonio.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(registro) {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este registro? Esta acción no se puede deshacer."
    );

    if (!confirmar) return;

    setEliminandoId(registro.id_testimonio);
    setMensaje("");
    setError("");

    try {
      await eliminarTestimonio(registro.id_testimonio);
      setMensaje("Testimonio eliminado correctamente.");
      await cargarRegistros();
    } catch (err) {
      setError(err.message || "No se pudo eliminar el testimonio.");
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
      <Navbar usuario={usuario} onCerrarSesion={() => {
        cerrarSesion();
        router.replace("/login");
      }} />

      <div className="dashboard-shell">
        <Sidebar />
        <section className="dashboard-content p-3 p-md-4 p-xl-5">
          <div className="mb-4">
            <span className="badge text-bg-primary mb-2">Testimonios</span>
            <h1 className="h2 fw-bold mb-1">Gestión de testimonios</h1>
            <p className="text-secondary mb-0">
              Administra los comentarios visibles en la página pública.
            </p>
          </div>

          <AlertMessage type="success" message={mensaje} />
          <AlertMessage type="danger" message={error} />

          <div className="row g-4">
            <div className="col-12 col-xl-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h2 className="h5 fw-bold mb-3">
                    {editando ? "Editar testimonio" : "Nuevo testimonio"}
                  </h2>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="nombre_cliente">
                        Cliente
                      </label>
                      <input
                        id="nombre_cliente"
                        name="nombre_cliente"
                        className="form-control"
                        value={formulario.nombre_cliente}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label" htmlFor="comentario">
                        Comentario
                      </label>
                      <textarea
                        id="comentario"
                        name="comentario"
                        className="form-control"
                        rows="4"
                        value={formulario.comentario}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label" htmlFor="calificacion">
                        Calificación
                      </label>
                      <input
                        id="calificacion"
                        name="calificacion"
                        type="text"
                        inputMode="numeric"
                        className="form-control"
                        value={formulario.calificacion}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label" htmlFor="url_foto">
                        URL foto
                      </label>
                      <input
                        id="url_foto"
                        name="url_foto"
                        className="form-control"
                        value={formulario.url_foto}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label" htmlFor="foto">
                        Subir foto
                      </label>
                      <input
                        id="foto"
                        type="file"
                        accept="image/*"
                        className="form-control"
                        onChange={handleUpload}
                        disabled={subiendo}
                      />
                    </div>

                    {formulario.url_foto && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={buildAssetUrl(formulario.url_foto)}
                        alt="Preview testimonio"
                        className="admin-thumb-lg mb-3"
                      />
                    )}

                    <div className="form-check form-switch mb-4">
                      <input
                        id="estado"
                        name="estado"
                        type="checkbox"
                        className="form-check-input"
                        checked={formulario.estado}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="estado">
                        Activo
                      </label>
                    </div>

                    <div className="d-flex flex-column flex-sm-row gap-2">
                      <button className="btn btn-primary" type="submit" disabled={guardando}>
                        {guardando ? "Guardando..." : editando ? "Actualizar" : "Guardar"}
                      </button>
                      {editando && (
                        <button
                          className="btn btn-secondary"
                          type="button"
                          onClick={limpiarFormulario}
                          disabled={guardando}
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-12 col-xl-8">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h2 className="h5 fw-bold mb-3">Listado</h2>
                  {cargando ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead>
                          <tr>
                            <th>Foto</th>
                            <th>Cliente</th>
                            <th>Comentario</th>
                            <th>Calificación</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registros.map((registro) => (
                            <tr key={registro.id_testimonio}>
                              <td>
                                {registro.url_foto ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={buildAssetUrl(registro.url_foto)}
                                    alt={registro.nombre_cliente}
                                    className="admin-table-thumb"
                                  />
                                ) : (
                                  <span className="text-secondary">Sin foto</span>
                                )}
                              </td>
                              <td>{registro.nombre_cliente}</td>
                              <td className="text-truncate" style={{ maxWidth: "18rem" }}>
                                {registro.comentario}
                              </td>
                              <td className="text-warning">{"★".repeat(Number(registro.calificacion || 0))}</td>
                              <td>
                                <span className={`badge ${registro.estado ? "text-bg-success" : "text-bg-secondary"}`}>
                                  {registro.estado ? "Activo" : "Inactivo"}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex flex-column flex-sm-row gap-2">
                                  <button className="btn btn-accent btn-sm" onClick={() => editar(registro)}>
                                    Editar
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleEliminar(registro)}
                                    disabled={eliminandoId === registro.id_testimonio}
                                  >
                                    {eliminandoId === registro.id_testimonio ? "Eliminando..." : "Eliminar"}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
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
