"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AlertMessage from "@/components/AlertMessage";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { buildAssetUrl } from "@/services/api";
import {
  actualizarPromocion,
  crearPromocion,
  eliminarPromocion,
  obtenerPromociones,
} from "@/services/promocionService";
import { subirImagenPromocion } from "@/services/uploadService";
import { cerrarSesion, obtenerToken, obtenerUsuario } from "@/utils/auth";

const formularioInicial = {
  titulo: "",
  descripcion: "",
  precio_original: "",
  precio_promocion: "",
  url_imagen: "",
  fecha_inicio: "",
  fecha_fin: "",
  estado: true,
};

function formatoMoneda(valor) {
  const numero = Number(valor || 0);

  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
  }).format(numero);
}

function normalizarFecha(valor) {
  return valor ? String(valor).slice(0, 10) : "";
}

export default function PromocionesPage() {
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
      const respuesta = await obtenerPromociones();
      setRegistros(respuesta?.data || []);
    } catch (err) {
      setError(err.message || "No se pudieron cargar las promociones.");
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

    setFormulario((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function limpiarFormulario() {
    setFormulario(formularioInicial);
    setEditando(null);
  }

  function editar(registro) {
    setEditando(registro);
    setFormulario({
      titulo: registro.titulo || "",
      descripcion: registro.descripcion || "",
      precio_original: registro.precio_original || "",
      precio_promocion: registro.precio_promocion || "",
      url_imagen: registro.url_imagen || "",
      fecha_inicio: normalizarFecha(registro.fecha_inicio),
      fecha_fin: normalizarFecha(registro.fecha_fin),
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
      const respuesta = await subirImagenPromocion(file);
      setFormulario((prev) => ({
        ...prev,
        url_imagen: respuesta?.data?.url || "",
      }));
      setMensaje("Imagen subida correctamente.");
    } catch (err) {
      setError(err.message || "No se pudo subir la imagen.");
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
        await actualizarPromocion(editando.id_promocion, formulario);
        setMensaje("Promoción actualizada correctamente.");
      } else {
        await crearPromocion(formulario);
        setMensaje("Promoción creada correctamente.");
      }

      limpiarFormulario();
      await cargarRegistros();
    } catch (err) {
      setError(err.message || "No se pudo guardar la promoción.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(registro) {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este registro? Esta acción no se puede deshacer."
    );

    if (!confirmar) return;

    setEliminandoId(registro.id_promocion);
    setMensaje("");
    setError("");

    try {
      await eliminarPromocion(registro.id_promocion);
      setMensaje("Promoción eliminada correctamente.");
      await cargarRegistros();
    } catch (err) {
      setError(err.message || "No se pudo eliminar la promoción.");
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
            <span className="badge text-bg-primary mb-2">Promociones</span>
            <h1 className="h2 fw-bold mb-1">Gestión de promociones</h1>
            <p className="text-secondary mb-0">
              Publica descuentos y ofertas vigentes para tus clientes.
            </p>
          </div>

          <AlertMessage type="success" message={mensaje} />
          <AlertMessage type="danger" message={error} />

          <div className="row g-4">
            <div className="col-12 col-xl-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h2 className="h5 fw-bold mb-3">
                    {editando ? "Editar promoción" : "Nueva promoción"}
                  </h2>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="titulo">
                        Título
                      </label>
                      <input
                        id="titulo"
                        name="titulo"
                        className="form-control"
                        value={formulario.titulo}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label" htmlFor="descripcion">
                        Descripción
                      </label>
                      <textarea
                        id="descripcion"
                        name="descripcion"
                        className="form-control"
                        rows="3"
                        value={formulario.descripcion}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label" htmlFor="precio_original">
                          Precio original
                        </label>
                        <input
                          id="precio_original"
                          name="precio_original"
                          type="number"
                          min="0"
                          step="0.01"
                          className="form-control"
                          value={formulario.precio_original}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label" htmlFor="precio_promocion">
                          Precio promoción
                        </label>
                        <input
                          id="precio_promocion"
                          name="precio_promocion"
                          type="number"
                          min="0"
                          step="0.01"
                          className="form-control"
                          value={formulario.precio_promocion}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="row g-3 mt-0">
                      <div className="col-12 col-md-6">
                        <label className="form-label" htmlFor="fecha_inicio">
                          Inicio
                        </label>
                        <input
                          id="fecha_inicio"
                          name="fecha_inicio"
                          type="date"
                          className="form-control"
                          value={formulario.fecha_inicio}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label" htmlFor="fecha_fin">
                          Fin
                        </label>
                        <input
                          id="fecha_fin"
                          name="fecha_fin"
                          type="date"
                          className="form-control"
                          value={formulario.fecha_fin}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="mb-3 mt-3">
                      <label className="form-label" htmlFor="url_imagen">
                        URL imagen
                      </label>
                      <input
                        id="url_imagen"
                        name="url_imagen"
                        className="form-control"
                        value={formulario.url_imagen}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label" htmlFor="imagen">
                        Subir imagen
                      </label>
                      <input
                        id="imagen"
                        type="file"
                        accept="image/*"
                        className="form-control"
                        onChange={handleUpload}
                        disabled={subiendo}
                      />
                    </div>

                    {formulario.url_imagen && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={buildAssetUrl(formulario.url_imagen)}
                        alt="Preview promoción"
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
                        Activa
                      </label>
                    </div>

                    <div className="d-flex flex-column flex-sm-row gap-2">
                      <button className="btn btn-primary" type="submit" disabled={guardando}>
                        {guardando ? "Guardando..." : editando ? "Actualizar" : "Guardar"}
                      </button>
                      {editando && (
                        <button className="btn btn-secondary" type="button" onClick={limpiarFormulario}>
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
                            <th>Imagen</th>
                            <th>Título</th>
                            <th>Precio</th>
                            <th>Vigencia</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registros.map((registro) => (
                            <tr key={registro.id_promocion}>
                              <td>
                                {registro.url_imagen ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={buildAssetUrl(registro.url_imagen)}
                                    alt={registro.titulo}
                                    className="admin-table-thumb"
                                  />
                                ) : (
                                  <span className="text-secondary">Sin imagen</span>
                                )}
                              </td>
                              <td>{registro.titulo}</td>
                              <td>
                                {registro.precio_original && (
                                  <span className="text-decoration-line-through text-secondary me-2">
                                    {formatoMoneda(registro.precio_original)}
                                  </span>
                                )}
                                <strong>{formatoMoneda(registro.precio_promocion)}</strong>
                              </td>
                              <td>
                                {normalizarFecha(registro.fecha_inicio) || "Sin inicio"} -{" "}
                                {normalizarFecha(registro.fecha_fin) || "Sin fin"}
                              </td>
                              <td>
                                <span className={`badge ${registro.estado ? "text-bg-success" : "text-bg-secondary"}`}>
                                  {registro.estado ? "Activa" : "Inactiva"}
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
                                    disabled={eliminandoId === registro.id_promocion}
                                  >
                                    {eliminandoId === registro.id_promocion ? "Eliminando..." : "Eliminar"}
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
