"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { buildAssetUrl } from "@/services/api";
import {
  actualizarServicio,
  crearServicio,
  eliminarServicio,
  obtenerServicios,
} from "@/services/servicioService";
import {
  subirImagenServicio,
  subirVideoServicio,
} from "@/services/uploadService";
import {
  cerrarSesion,
  obtenerToken,
  obtenerUsuario,
} from "@/utils/auth";

const formularioInicial = {
  nombre: "",
  descripcion: "",
  precio: "",
  duracion_minutos: "",
  estado: "true",
  url_foto: "",
  url_video: "",
};

function prepararServicio(formulario) {
  return {
    nombre: formulario.nombre,
    descripcion: formulario.descripcion || null,
    precio: Number(formulario.precio),
    duracion_minutos: Number(formulario.duracion_minutos),
    estado: formulario.estado === "true",
    url_foto: formulario.url_foto || null,
    url_video: formulario.url_video || null,
  };
}

function construirVideoUrl(urlVideo) {
  if (!urlVideo) return "";

  return urlVideo.startsWith("/uploads")
    ? `http://localhost:3000${urlVideo}`
    : urlVideo;
}

export default function ServiciosPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [servicioEditando, setServicioEditando] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [cargandoServicios, setCargandoServicios] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [subiendoArchivo, setSubiendoArchivo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function cargarServicios() {
    setCargandoServicios(true);
    setError("");

    try {
      const respuesta = await obtenerServicios();
      setServicios(respuesta?.data || []);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los servicios.");
    } finally {
      setCargandoServicios(false);
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
      cargarServicios();
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

  async function handleSubirImagen(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSubiendoArchivo("imagen");
    setMensaje("");
    setError("");

    try {
      const respuesta = await subirImagenServicio(file);
      setFormulario((prevFormulario) => ({
        ...prevFormulario,
        url_foto: respuesta?.data?.url || "",
      }));
      setMensaje("Imagen de servicio subida correctamente.");
    } catch (err) {
      setError(err.message || "No se pudo subir la imagen.");
    } finally {
      setSubiendoArchivo("");
      event.target.value = "";
    }
  }

  async function handleSubirVideo(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSubiendoArchivo("video");
    setMensaje("");
    setError("");

    try {
      const respuesta = await subirVideoServicio(file);
      setFormulario((prevFormulario) => ({
        ...prevFormulario,
        url_video: respuesta?.data?.url || "",
      }));
      setMensaje("Video de servicio subido correctamente.");
    } catch (err) {
      setError(err.message || "No se pudo subir el video.");
    } finally {
      setSubiendoArchivo("");
      event.target.value = "";
    }
  }

  function limpiarFormulario() {
    setFormulario(formularioInicial);
    setServicioEditando(null);
  }

  function editarServicio(servicio) {
    setServicioEditando(servicio);
    setFormulario({
      nombre: servicio.nombre || "",
      descripcion: servicio.descripcion || "",
      precio: servicio.precio ?? "",
      duracion_minutos: servicio.duracion_minutos ?? "",
      estado: servicio.estado ? "true" : "false",
      url_foto: servicio.url_foto || "",
      url_video: servicio.url_video || "",
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
      const datosServicio = prepararServicio(formulario);

      if (servicioEditando) {
        await actualizarServicio(servicioEditando.id_servicio, datosServicio);
        setMensaje("Servicio actualizado correctamente.");
      } else {
        await crearServicio(datosServicio);
        setMensaje("Servicio creado correctamente.");
      }

      limpiarFormulario();
      await cargarServicios();
    } catch (err) {
      setError(err.message || "No se pudo guardar el servicio.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(servicio) {
    const confirmar = window.confirm(`¿Eliminar el servicio ${servicio.nombre}?`);

    if (!confirmar) return;

    setMensaje("");
    setError("");

    try {
      await eliminarServicio(servicio.id_servicio);
      setMensaje("Servicio eliminado correctamente.");
      await cargarServicios();
    } catch (err) {
      setError(err.message || "No se pudo eliminar el servicio.");
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
            <span className="badge text-bg-primary mb-2">Servicios</span>
            <h1 className="h2 fw-bold mb-1">Gestión de servicios</h1>
            <p className="text-secondary mb-0">
              Crea, edita y elimina servicios del salón.
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
                    {servicioEditando ? "Editar servicio" : "Nuevo servicio"}
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
                      <label htmlFor="descripcion" className="form-label">
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
                        <label htmlFor="precio" className="form-label">
                          Precio
                        </label>
                        <input
                          id="precio"
                          name="precio"
                          type="number"
                          min="0"
                          step="0.01"
                          className="form-control"
                          value={formulario.precio}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label htmlFor="duracion_minutos" className="form-label">
                          Duración
                        </label>
                        <input
                          id="duracion_minutos"
                          name="duracion_minutos"
                          type="number"
                          min="1"
                          className="form-control"
                          value={formulario.duracion_minutos}
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
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="archivo_foto_servicio" className="form-label">
                        Subir foto
                      </label>
                      <input
                        id="archivo_foto_servicio"
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        className="form-control"
                        onChange={handleSubirImagen}
                        disabled={subiendoArchivo === "imagen"}
                      />
                      {subiendoArchivo === "imagen" && (
                        <small className="text-secondary">Subiendo imagen...</small>
                      )}
                    </div>

                    {formulario.url_foto && (
                      <img
                        src={buildAssetUrl(formulario.url_foto)}
                        alt="Vista previa del servicio"
                        className="upload-preview mb-3"
                      />
                    )}

                    <div className="mb-3">
                      <label htmlFor="url_foto" className="form-label">
                        URL de foto
                      </label>
                      <input
                        id="url_foto"
                        name="url_foto"
                        type="text"
                        className="form-control"
                        value={formulario.url_foto}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="archivo_video_servicio" className="form-label">
                        Subir video
                      </label>
                      <input
                        id="archivo_video_servicio"
                        type="file"
                        accept=".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime"
                        className="form-control"
                        onChange={handleSubirVideo}
                        disabled={subiendoArchivo === "video"}
                      />
                      {subiendoArchivo === "video" && (
                        <small className="text-secondary">Subiendo video...</small>
                      )}
                    </div>

                    <div className="mb-4">
                      <label htmlFor="url_video" className="form-label">
                        URL de video
                      </label>
                      <input
                        id="url_video"
                        name="url_video"
                        type="text"
                        className="form-control"
                        value={formulario.url_video}
                        onChange={handleChange}
                      />
                    </div>

                    {formulario.url_video && (
                      <div className="mb-4">
                        <p className="small fw-bold text-secondary mb-2">Video</p>
                        <video controls preload="metadata" className="w-100 rounded">
                          <source src={construirVideoUrl(formulario.url_video)} />
                        </video>
                      </div>
                    )}

                    <div className="d-grid gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={guardando}
                      >
                        {guardando
                          ? "Guardando..."
                          : servicioEditando
                            ? "Actualizar servicio"
                            : "Crear servicio"}
                      </button>

                      {servicioEditando && (
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
                    <h2 className="h5 fw-bold mb-0">Listado de servicios</h2>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={cargarServicios}
                      disabled={cargandoServicios}
                    >
                      Actualizar
                    </button>
                  </div>

                  {cargandoServicios ? (
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
                            <th>Foto</th>
                            <th>Video</th>
                            <th>Servicio</th>
                            <th>Precio</th>
                            <th>Duración</th>
                            <th>Estado</th>
                            <th className="text-end">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {servicios.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="text-center text-secondary py-4">
                                No hay servicios registrados.
                              </td>
                            </tr>
                          ) : (
                            servicios.map((servicio) => (
                              <tr key={servicio.id_servicio}>
                                <td>
                                  {servicio.url_foto ? (
                                    <img
                                      src={buildAssetUrl(servicio.url_foto)}
                                      alt={servicio.nombre}
                                      className="table-thumb"
                                    />
                                  ) : (
                                    <span className="text-secondary small">Sin foto</span>
                                  )}
                                </td>
                                <td style={{ minWidth: "12rem" }}>
                                  {servicio.url_video ? (
                                    <video controls preload="metadata" className="w-100 rounded">
                                      <source src={construirVideoUrl(servicio.url_video)} />
                                    </video>
                                  ) : (
                                    <span className="text-secondary small">Sin video</span>
                                  )}
                                </td>
                                <td>
                                  <div className="fw-semibold">
                                    {servicio.nombre}
                                  </div>
                                  {servicio.descripcion && (
                                    <small className="text-secondary">
                                      {servicio.descripcion}
                                    </small>
                                  )}
                                </td>
                                <td>Q {Number(servicio.precio).toFixed(2)}</td>
                                <td>{servicio.duracion_minutos} min</td>
                                <td>
                                  <span
                                    className={`badge ${
                                      servicio.estado
                                        ? "text-bg-success"
                                        : "text-bg-secondary"
                                    }`}
                                  >
                                    {servicio.estado ? "Activo" : "Inactivo"}
                                  </span>
                                </td>
                                <td>
                                  <div className="d-flex justify-content-end gap-2">
                                    <button
                                      type="button"
                                      className="btn btn-accent btn-sm"
                                      onClick={() => editarServicio(servicio)}
                                    >
                                      Editar
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => handleEliminar(servicio)}
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
