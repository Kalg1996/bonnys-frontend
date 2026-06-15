"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AlertMessage from "@/components/AlertMessage";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import VideoPlayer from "@/components/VideoPlayer";
import { buildAssetUrl } from "@/services/api";
import {
  actualizarGaleriaTrabajo,
  crearGaleriaTrabajo,
  eliminarGaleriaTrabajo,
  obtenerGaleriaTrabajos,
} from "@/services/galeriaTrabajoService";
import { subirMediaGaleriaTrabajo } from "@/services/uploadService";
import { cerrarSesion, obtenerToken, obtenerUsuario } from "@/utils/auth";

const formularioInicial = {
  titulo: "",
  descripcion: "",
  tipo: "IMAGEN",
  url_media: "",
  destacado: false,
  estado: true,
};

function MediaPreview({ item, grande = false }) {
  if (!item?.url_media) return null;

  const url = buildAssetUrl(item.url_media);

  if (item.tipo === "VIDEO") {
    return (
      <VideoPlayer
        url={item.url_media}
        title={item.titulo || "Trabajo"}
        className={grande ? "admin-media-preview" : "admin-table-video"}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={item.titulo || "Trabajo"}
      className={grande ? "admin-thumb-lg" : "admin-table-thumb"}
    />
  );
}

export default function GaleriaTrabajosPage() {
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
      const respuesta = await obtenerGaleriaTrabajos();
      setRegistros(respuesta?.data || []);
    } catch (err) {
      setError(err.message || "No se pudo cargar la galería de trabajos.");
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
      tipo: registro.tipo || "IMAGEN",
      url_media: registro.url_media || "",
      destacado: Boolean(registro.destacado),
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
      const respuesta = await subirMediaGaleriaTrabajo(file);
      const tipo = file.type.startsWith("video/") ? "VIDEO" : "IMAGEN";
      setFormulario((prev) => ({
        ...prev,
        tipo,
        url_media: respuesta?.data?.url || "",
      }));
      setMensaje("Archivo subido correctamente.");
    } catch (err) {
      setError(err.message || "No se pudo subir el archivo.");
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
        await actualizarGaleriaTrabajo(editando.id_trabajo, formulario);
        setMensaje("Trabajo actualizado correctamente.");
      } else {
        await crearGaleriaTrabajo(formulario);
        setMensaje("Trabajo creado correctamente.");
      }

      limpiarFormulario();
      await cargarRegistros();
    } catch (err) {
      setError(err.message || "No se pudo guardar el trabajo.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(registro) {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este registro? Esta acción no se puede deshacer."
    );

    if (!confirmar) return;

    setEliminandoId(registro.id_trabajo);
    setMensaje("");
    setError("");

    try {
      await eliminarGaleriaTrabajo(registro.id_trabajo);
      setMensaje("Trabajo eliminado correctamente.");
      await cargarRegistros();
    } catch (err) {
      setError(err.message || "No se pudo eliminar el trabajo.");
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
            <span className="badge text-bg-primary mb-2">Galería</span>
            <h1 className="h2 fw-bold mb-1">Galería de trabajos</h1>
            <p className="text-secondary mb-0">
              Administra imágenes y videos del trabajo realizado en el salón.
            </p>
          </div>

          <AlertMessage type="success" message={mensaje} />
          <AlertMessage type="danger" message={error} />

          <div className="row g-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h2 className="h5 fw-bold mb-3">
                    {editando ? "Editar trabajo" : "Nuevo trabajo"}
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

                    <div className="mb-3">
                      <label className="form-label" htmlFor="tipo">
                        Tipo
                      </label>
                      <select
                        id="tipo"
                        name="tipo"
                        className="form-select"
                        value={formulario.tipo}
                        onChange={handleChange}
                      >
                        <option value="IMAGEN">Imagen</option>
                        <option value="VIDEO">Video</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label" htmlFor="url_media">
                        URL media
                      </label>
                      <input
                        id="url_media"
                        name="url_media"
                        className="form-control"
                        value={formulario.url_media}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label" htmlFor="media">
                        Subir imagen o video
                      </label>
                      <input
                        id="media"
                        type="file"
                        accept="image/*,video/*"
                        className="form-control"
                        onChange={handleUpload}
                        disabled={subiendo}
                      />
                      <div className="form-text">
                        Los videos no pueden durar más de 60 segundos.
                      </div>
                    </div>

                    {formulario.url_media && (
                      <div className="mb-3">
                        <MediaPreview item={formulario} grande />
                      </div>
                    )}

                    <div className="d-flex flex-column gap-2 mb-4">
                      <div className="form-check form-switch">
                        <input
                          id="destacado"
                          name="destacado"
                          type="checkbox"
                          className="form-check-input"
                          checked={formulario.destacado}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="destacado">
                          Destacado
                        </label>
                      </div>
                      <div className="form-check form-switch">
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

            <div className="col-12">
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
                            <th>Media</th>
                            <th>Título</th>
                            <th>Tipo</th>
                            <th>Destacado</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registros.map((registro) => (
                            <tr key={registro.id_trabajo}>
                              <td>
                                <MediaPreview item={registro} />
                              </td>
                              <td>{registro.titulo || "Sin título"}</td>
                              <td>{registro.tipo}</td>
                              <td>
                                <span className={`badge ${registro.destacado ? "text-bg-warning" : "text-bg-light text-dark"}`}>
                                  {registro.destacado ? "Sí" : "No"}
                                </span>
                              </td>
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
                                    disabled={eliminandoId === registro.id_trabajo}
                                  >
                                    {eliminandoId === registro.id_trabajo ? "Eliminando..." : "Eliminar"}
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
