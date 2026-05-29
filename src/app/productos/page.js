"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  obtenerProductos,
} from "@/services/productoService";
import {
  cerrarSesion,
  obtenerToken,
  obtenerUsuario,
} from "@/utils/auth";

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
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function cargarProductos() {
    setCargandoProductos(true);
    setError("");

    try {
      const respuesta = await obtenerProductos();
      setProductos(respuesta?.data || []);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los productos.");
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

    setFormulario((prevFormulario) => ({
      ...prevFormulario,
      [name]: value,
    }));
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
        setMensaje("Producto actualizado correctamente.");
      } else {
        await crearProducto(datosProducto);
        setMensaje("Producto creado correctamente.");
      }

      limpiarFormulario();
      await cargarProductos();
    } catch (err) {
      setError(err.message || "No se pudo guardar el producto.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(producto) {
    const confirmar = window.confirm(`¿Eliminar el producto ${producto.nombre}?`);

    if (!confirmar) return;

    setMensaje("");
    setError("");

    try {
      await eliminarProducto(producto.id_producto);
      setMensaje("Producto eliminado correctamente.");
      await cargarProductos();
    } catch (err) {
      setError(err.message || "No se pudo eliminar el producto.");
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
                        type="number"
                        min="0"
                        step="0.01"
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
                          type="number"
                          min="0"
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
                          type="number"
                          min="0"
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
                      <label htmlFor="url_foto" className="form-label">
                        URL de foto
                      </label>
                      <input
                        id="url_foto"
                        name="url_foto"
                        type="url"
                        className="form-control"
                        value={formulario.url_foto}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="url_video" className="form-label">
                        URL de video
                      </label>
                      <input
                        id="url_video"
                        name="url_video"
                        type="url"
                        className="form-control"
                        value={formulario.url_video}
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

            <div className="col-12 col-xl-8">
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
                              <td colSpan="5" className="text-center text-secondary py-4">
                                No hay productos registrados.
                              </td>
                            </tr>
                          ) : (
                            productos.map((producto) => (
                              <tr key={producto.id_producto}>
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
                                      className="btn btn-outline-primary btn-sm"
                                      onClick={() => editarProducto(producto)}
                                    >
                                      Editar
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => handleEliminar(producto)}
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
