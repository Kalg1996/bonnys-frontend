"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AlertMessage from "@/components/AlertMessage";
import MediaCarousel from "@/components/MediaCarousel";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import {
  agregarMediaServicio,
  eliminarMediaServicio,
  obtenerGaleriaServicio,
} from "@/services/galeriaService";
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
import { normalizarCampoNumerico } from "@/utils/numberInput";

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

export default function ServiciosPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [servicioEditando, setServicioEditando] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [cargandoServicios, setCargandoServicios] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [subiendoArchivo, setSubiendoArchivo] = useState("");
  const [servicioGaleria, setServicioGaleria] = useState(null);
  const [galeria, setGaleria] = useState([]);
  const [cargandoGaleria, setCargandoGaleria] = useState(false);
  const [subiendoGaleria, setSubiendoGaleria] = useState("");
  const [eliminandoMediaId, setEliminandoMediaId] = useState(null);
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
    const valor = normalizarCampoNumerico(name, value, {
      decimales: ["precio"],
      enteros: ["duracion_minutos"],
    });

    setFormulario((prevFormulario) => ({
      ...prevFormulario,
      [name]: valor,
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

  async function abrirGaleria(servicio) {
    setServicioGaleria(servicio);
    setCargandoGaleria(true);
    setMensaje("");
    setError("");

    try {
      const respuesta = await obtenerGaleriaServicio(servicio.id_servicio);
      setGaleria(respuesta?.data || []);
    } catch (err) {
      setError(err.message || "No se pudo cargar la galería.");
    } finally {
      setCargandoGaleria(false);
    }
  }

  async function handleSubirImagenGaleria(event) {
    const file = event.target.files?.[0];
    if (!file || !servicioGaleria) return;

    setSubiendoGaleria("imagen");
    setMensaje("");
    setError("");

    try {
      const upload = await subirImagenServicio(file);
      await agregarMediaServicio(servicioGaleria.id_servicio, {
        tipo: "IMAGEN",
        url: upload?.data?.url,
        orden: galeria.length,
      });
      setMensaje("Imagen agregada a la galería.");
      await abrirGaleria(servicioGaleria);
    } catch (err) {
      setError(err.message || "No se pudo agregar la imagen a la galería.");
    } finally {
      setSubiendoGaleria("");
      event.target.value = "";
    }
  }

  async function handleSubirVideoGaleria(event) {
    const file = event.target.files?.[0];
    if (!file || !servicioGaleria) return;

    setSubiendoGaleria("video");
    setMensaje("");
    setError("");

    try {
      const upload = await subirVideoServicio(file);
      await agregarMediaServicio(servicioGaleria.id_servicio, {
        tipo: "VIDEO",
        url: upload?.data?.url,
        orden: galeria.length,
      });
      setMensaje("Video agregado a la galería.");
      await abrirGaleria(servicioGaleria);
    } catch (err) {
      setError(err.message || "No se pudo agregar el video a la galería.");
    } finally {
      setSubiendoGaleria("");
      event.target.value = "";
    }
  }

  async function handleEliminarMediaGaleria(idMedia) {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este registro? Esta acción no se puede deshacer."
    );

    if (!confirmar) return;

    setEliminandoMediaId(idMedia);
    setMensaje("");
    setError("");

    try {
      await eliminarMediaServicio(idMedia);
      setMensaje("Elemento eliminado de la galería.");
      await abrirGaleria(servicioGaleria);
    } catch (err) {
      setError(err.message || "No se pudo eliminar el elemento.");
    } finally {
      setEliminandoMediaId(null);
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
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este registro? Esta acción no se puede deshacer."
    );

    if (!confirmar) return;

    setEliminandoId(servicio.id_servicio);
    setMensaje("");
    setError("");

    try {
      await eliminarServicio(servicio.id_servicio);
      setMensaje("Servicio eliminado correctamente.");
      await cargarServicios();
    } catch (err) {
      setError(err.message || "No se pudo eliminar el servicio.");
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
            <span className="badge text-bg-primary mb-2">Servicios</span>
            <h1 className="h2 fw-bold mb-1">Gestión de servicios</h1>
            <p className="text-secondary mb-0">
              Crea, edita y elimina servicios del salón.
            </p>
          </div>

          <AlertMessage type="success" message={mensaje} />
          <AlertMessage type="danger" message={error} />

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
                          type="text"
                          inputMode="decimal"
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
                          type="text"
                          inputMode="numeric"
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

                    {(formulario.url_foto || formulario.url_video) && (
                      <div className="mb-4">
                        <p className="small fw-bold text-secondary mb-2">
                          Vista previa
                        </p>
                        <MediaCarousel
                          id="servicio-form-media"
                          imageUrl={formulario.url_foto}
                          videoUrl={formulario.url_video}
                          imageAlt="Vista previa del servicio"
                        />
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
                            <th>Multimedia</th>
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
                              <td colSpan="6" className="text-center text-secondary py-4">
                                No hay servicios registrados.
                              </td>
                            </tr>
                          ) : (
                            servicios.map((servicio) => (
                              <tr key={servicio.id_servicio}>
                                <td style={{ minWidth: "12rem", width: "12rem" }}>
                                  {servicio.url_foto || servicio.url_video ? (
                                    <MediaCarousel
                                      id={`servicio-admin-${servicio.id_servicio}`}
                                      imageUrl={servicio.url_foto}
                                      videoUrl={servicio.url_video}
                                      imageAlt={servicio.nombre}
                                    />
                                  ) : (
                                    <span className="text-secondary small">
                                      Sin multimedia
                                    </span>
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
                                      className="btn btn-outline-primary btn-sm"
                                      onClick={() => abrirGaleria(servicio)}
                                    >
                                      Galería
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => handleEliminar(servicio)}
                                      disabled={eliminandoId === servicio.id_servicio}
                                    >
                                      {eliminandoId === servicio.id_servicio
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

            {servicioGaleria && (
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
                      <div>
                        <span className="badge text-bg-primary mb-2">Galería</span>
                        <h2 className="h4 fw-bold mb-1">{servicioGaleria.nombre}</h2>
                        <p className="text-secondary mb-0">
                          Administra imágenes y videos adicionales del servicio.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline-secondary align-self-md-start"
                        onClick={() => {
                          setServicioGaleria(null);
                          setGaleria([]);
                        }}
                      >
                        Cerrar galería
                      </button>
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-12 col-md-6">
                        <label className="form-label" htmlFor="galeria_servicio_imagen">
                          Agregar imagen
                        </label>
                        <input
                          id="galeria_servicio_imagen"
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                          className="form-control"
                          onChange={handleSubirImagenGaleria}
                          disabled={subiendoGaleria === "imagen"}
                        />
                        {subiendoGaleria === "imagen" && (
                          <small className="text-secondary">Subiendo imagen...</small>
                        )}
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label" htmlFor="galeria_servicio_video">
                          Agregar video
                        </label>
                        <input
                          id="galeria_servicio_video"
                          type="file"
                          accept=".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime"
                          className="form-control"
                          onChange={handleSubirVideoGaleria}
                          disabled={subiendoGaleria === "video"}
                        />
                        {subiendoGaleria === "video" && (
                          <small className="text-secondary">Subiendo video...</small>
                        )}
                      </div>
                    </div>

                    {cargandoGaleria ? (
                      <div className="py-4 text-center">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Cargando...</span>
                        </div>
                      </div>
                    ) : galeria.length === 0 ? (
                      <p className="text-secondary mb-0">No hay elementos en la galería.</p>
                    ) : (
                      <div className="row g-3">
                        {galeria.map((media) => (
                          <div className="col-12 col-md-6 col-xl-3" key={media.id_media}>
                            <div className="border rounded-3 p-2 h-100 bg-light">
                              <MediaCarousel
                                id={`servicio-galeria-${media.id_media}`}
                                imageUrl={media.tipo === "IMAGEN" ? media.url : ""}
                                videoUrl={media.tipo === "VIDEO" ? media.url : ""}
                                imageAlt={servicioGaleria.nombre}
                              />
                              <div className="d-flex justify-content-between align-items-center gap-2 mt-2">
                                <span className="badge text-bg-light border">{media.tipo}</span>
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleEliminarMediaGaleria(media.id_media)}
                                  disabled={eliminandoMediaId === media.id_media}
                                >
                                  {eliminandoMediaId === media.id_media
                                    ? "Eliminando..."
                                    : "Eliminar"}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
