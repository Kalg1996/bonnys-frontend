"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AlertMessage from "@/components/AlertMessage";
import MediaCarousel from "@/components/MediaCarousel";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import {
  agregarMediaProducto,
  eliminarMediaProducto,
  obtenerGaleriaProducto,
} from "@/services/galeriaService";
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  obtenerProductos,
} from "@/services/productoService";
import {
  subirImagenProducto,
  subirVideoProducto,
} from "@/services/uploadService";
import {
  cerrarSesion,
  obtenerToken,
  obtenerUsuario,
} from "@/utils/auth";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { normalizarCampoNumerico } from "@/utils/numberInput";
import { toastError, toastSuccess } from "@/utils/toast";

const formularioInicial = {
  nombre: "",
  descripcion: "",
  precio_venta: "",
  stock_actual: "0",
  stock_minimo: "0",
  estado: "true",
  url_foto: "",
  url_video: "",
};

function prepararProducto(formulario) {
  return {
    nombre: formulario.nombre,
    descripcion: formulario.descripcion || null,
    precio_venta: Number(formulario.precio_venta),
    stock_actual: Number(formulario.stock_actual),
    stock_minimo: Number(formulario.stock_minimo),
    estado: formulario.estado === "true",
    url_foto: formulario.url_foto || null,
    url_video: formulario.url_video || null,
  };
}

function tieneStockBajo(producto) {
  return Number(producto.stock_actual) <= Number(producto.stock_minimo);
}

export default function ProductosPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [productos, setProductos] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [productoEditando, setProductoEditando] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [cargandoProductos, setCargandoProductos] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [subiendoArchivo, setSubiendoArchivo] = useState("");
  const [productoGaleria, setProductoGaleria] = useState(null);
  const [galeria, setGaleria] = useState([]);
  const [cargandoGaleria, setCargandoGaleria] = useState(false);
  const [subiendoGaleria, setSubiendoGaleria] = useState("");
  const [eliminandoMediaId, setEliminandoMediaId] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  function mostrarExito(mensajeExito) {
    setMensaje(mensajeExito);
    toastSuccess(mensajeExito);
  }

  function mostrarError(err, fallback) {
    const mensajeError = getErrorMessage(err, fallback);
    setError(mensajeError);
    toastError(mensajeError);
  }

  async function cargarProductos() {
    setCargandoProductos(true);
    setError("");

    try {
      const respuesta = await obtenerProductos();
      setProductos(respuesta?.data || []);
    } catch (err) {
      mostrarError(err, "No se pudieron cargar los productos.");
    } finally {
      setCargandoProductos(false);
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
      cargarProductos();
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
      decimales: ["precio_venta"],
      enteros: ["stock_actual", "stock_minimo"],
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
      const respuesta = await subirImagenProducto(file);
      setFormulario((prevFormulario) => ({
        ...prevFormulario,
        url_foto: respuesta?.data?.url || "",
      }));
      mostrarExito("Imagen de producto subida correctamente.");
    } catch (err) {
      mostrarError(err, "No se pudo subir la imagen.");
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
      const respuesta = await subirVideoProducto(file);
      setFormulario((prevFormulario) => ({
        ...prevFormulario,
        url_video: respuesta?.data?.url || "",
      }));
      mostrarExito("Video de producto subido correctamente.");
    } catch (err) {
      mostrarError(err, "No se pudo subir el video.");
    } finally {
      setSubiendoArchivo("");
      event.target.value = "";
    }
  }

  async function abrirGaleria(producto) {
    setProductoGaleria(producto);
    setCargandoGaleria(true);
    setMensaje("");
    setError("");

    try {
      const respuesta = await obtenerGaleriaProducto(producto.id_producto);
      setGaleria(respuesta?.data || []);
    } catch (err) {
      mostrarError(err, "No se pudo cargar la galería.");
    } finally {
      setCargandoGaleria(false);
    }
  }

  async function handleSubirImagenGaleria(event) {
    const file = event.target.files?.[0];
    if (!file || !productoGaleria) return;

    setSubiendoGaleria("imagen");
    setMensaje("");
    setError("");

    try {
      const upload = await subirImagenProducto(file);
      await agregarMediaProducto(productoGaleria.id_producto, {
        tipo: "IMAGEN",
        url: upload?.data?.url,
        orden: galeria.length,
      });
      mostrarExito("Imagen agregada a la galería.");
      await abrirGaleria(productoGaleria);
    } catch (err) {
      mostrarError(err, "No se pudo agregar la imagen a la galería.");
    } finally {
      setSubiendoGaleria("");
      event.target.value = "";
    }
  }

  async function handleSubirVideoGaleria(event) {
    const file = event.target.files?.[0];
    if (!file || !productoGaleria) return;

    setSubiendoGaleria("video");
    setMensaje("");
    setError("");

    try {
      const upload = await subirVideoProducto(file);
      await agregarMediaProducto(productoGaleria.id_producto, {
        tipo: "VIDEO",
        url: upload?.data?.url,
        orden: galeria.length,
      });
      mostrarExito("Video agregado a la galería.");
      await abrirGaleria(productoGaleria);
    } catch (err) {
      mostrarError(err, "No se pudo agregar el video a la galería.");
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
      await eliminarMediaProducto(idMedia);
      mostrarExito("Elemento eliminado de la galería.");
      await abrirGaleria(productoGaleria);
    } catch (err) {
      mostrarError(err, "No se pudo eliminar el elemento.");
    } finally {
      setEliminandoMediaId(null);
    }
  }

  function limpiarFormulario() {
    setFormulario(formularioInicial);
    setProductoEditando(null);
  }

  function editarProducto(producto) {
    setProductoEditando(producto);
    setFormulario({
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      precio_venta: producto.precio_venta ?? "",
      stock_actual: producto.stock_actual ?? "0",
      stock_minimo: producto.stock_minimo ?? "0",
      estado: producto.estado ? "true" : "false",
      url_foto: producto.url_foto || "",
      url_video: producto.url_video || "",
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
      const datosProducto = prepararProducto(formulario);

      if (productoEditando) {
        await actualizarProducto(productoEditando.id_producto, datosProducto);
        mostrarExito("Producto actualizado correctamente.");
      } else {
        await crearProducto(datosProducto);
        mostrarExito("Producto creado correctamente.");
      }

      limpiarFormulario();
      await cargarProductos();
    } catch (err) {
      mostrarError(err, "No se pudo guardar el producto.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(producto) {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este registro? Esta acción no se puede deshacer."
    );

    if (!confirmar) return;

    setEliminandoId(producto.id_producto);
    setMensaje("");
    setError("");

    try {
      await eliminarProducto(producto.id_producto);
      mostrarExito("Producto eliminado correctamente.");
      await cargarProductos();
    } catch (err) {
      mostrarError(err, "No se pudo eliminar el producto.");
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
            <span className="badge text-bg-primary mb-2">Productos</span>
            <h1 className="h2 fw-bold mb-1">Gestión de productos</h1>
            <p className="text-secondary mb-0">
              Crea, edita y elimina productos del salón.
            </p>
          </div>

          <AlertMessage type="success" message={mensaje} />
          <AlertMessage type="danger" message={error} />

          <div className="row g-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h2 className="h5 fw-bold mb-3">
                    {productoEditando ? "Editar producto" : "Nuevo producto"}
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

                    <div className="mb-3">
                      <label htmlFor="precio_venta" className="form-label">
                        Precio de venta
                      </label>
                      <input
                        id="precio_venta"
                        name="precio_venta"
                        type="text"
                        inputMode="decimal"
                        className="form-control"
                        value={formulario.precio_venta}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label htmlFor="stock_actual" className="form-label">
                          Stock actual
                        </label>
                        <input
                          id="stock_actual"
                          name="stock_actual"
                          type="text"
                          inputMode="numeric"
                          className="form-control"
                          value={formulario.stock_actual}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label htmlFor="stock_minimo" className="form-label">
                          Stock mínimo
                        </label>
                        <input
                          id="stock_minimo"
                          name="stock_minimo"
                          type="text"
                          inputMode="numeric"
                          className="form-control"
                          value={formulario.stock_minimo}
                          onChange={handleChange}
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
                      <label htmlFor="archivo_foto_producto" className="form-label">
                        Subir foto
                      </label>
                      <input
                        id="archivo_foto_producto"
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
                      <label htmlFor="archivo_video_producto" className="form-label">
                        Subir video
                      </label>
                      <input
                        id="archivo_video_producto"
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
                          id="producto-form-media"
                          imageUrl={formulario.url_foto}
                          videoUrl={formulario.url_video}
                          imageAlt="Vista previa del producto"
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
                          : productoEditando
                            ? "Actualizar producto"
                            : "Crear producto"}
                      </button>

                      {productoEditando && (
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

            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                  <div className="d-flex align-items-center justify-content-between gap-3 p-4 border-bottom">
                    <h2 className="h5 fw-bold mb-0">Listado de productos</h2>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={cargarProductos}
                      disabled={cargandoProductos}
                    >
                      Actualizar
                    </button>
                  </div>

                  {cargandoProductos ? (
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
                            <th>Producto</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Estado</th>
                            <th className="text-end">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productos.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="text-center text-secondary py-4">
                                No hay productos registrados.
                              </td>
                            </tr>
                          ) : (
                            productos.map((producto) => (
                              <tr key={producto.id_producto}>
                                <td style={{ minWidth: "12rem", width: "12rem" }}>
                                  {producto.url_foto || producto.url_video ? (
                                    <MediaCarousel
                                      id={`producto-admin-${producto.id_producto}`}
                                      imageUrl={producto.url_foto}
                                      videoUrl={producto.url_video}
                                      imageAlt={producto.nombre}
                                    />
                                  ) : (
                                    <span className="text-secondary small">
                                      Sin multimedia
                                    </span>
                                  )}
                                </td>
                                <td>
                                  <div className="fw-semibold">
                                    {producto.nombre}
                                  </div>
                                  {producto.descripcion && (
                                    <small className="text-secondary">
                                      {producto.descripcion}
                                    </small>
                                  )}
                                </td>
                                <td>
                                  Q {Number(producto.precio_venta).toFixed(2)}
                                </td>
                                <td>
                                  <div>
                                    {producto.stock_actual} / mínimo{" "}
                                    {producto.stock_minimo}
                                  </div>
                                  {tieneStockBajo(producto) && (
                                    <span className="badge text-bg-danger">
                                      Stock bajo
                                    </span>
                                  )}
                                </td>
                                <td>
                                  <span
                                    className={`badge ${
                                      producto.estado
                                        ? "text-bg-success"
                                        : "text-bg-secondary"
                                    }`}
                                  >
                                    {producto.estado ? "Activo" : "Inactivo"}
                                  </span>
                                </td>
                                <td>
                                  <div className="d-flex justify-content-end gap-2">
                                    <button
                                      type="button"
                                      className="btn btn-accent btn-sm"
                                      onClick={() => editarProducto(producto)}
                                    >
                                      Editar
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-outline-primary btn-sm"
                                      onClick={() => abrirGaleria(producto)}
                                    >
                                      Galería
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => handleEliminar(producto)}
                                      disabled={eliminandoId === producto.id_producto}
                                    >
                                      {eliminandoId === producto.id_producto
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

            {productoGaleria && (
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
                      <div>
                        <span className="badge text-bg-primary mb-2">Galería</span>
                        <h2 className="h4 fw-bold mb-1">{productoGaleria.nombre}</h2>
                        <p className="text-secondary mb-0">
                          Administra imágenes y videos adicionales del producto.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline-secondary align-self-md-start"
                        onClick={() => {
                          setProductoGaleria(null);
                          setGaleria([]);
                        }}
                      >
                        Cerrar galería
                      </button>
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-12 col-md-6">
                        <label className="form-label" htmlFor="galeria_producto_imagen">
                          Agregar imagen
                        </label>
                        <input
                          id="galeria_producto_imagen"
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
                        <label className="form-label" htmlFor="galeria_producto_video">
                          Agregar video
                        </label>
                        <input
                          id="galeria_producto_video"
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
                                id={`producto-galeria-${media.id_media}`}
                                imageUrl={media.tipo === "IMAGEN" ? media.url : ""}
                                videoUrl={media.tipo === "VIDEO" ? media.url : ""}
                                imageAlt={productoGaleria.nombre}
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
