"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buildAssetUrl } from "@/services/api";
import { obtenerProductosPublicos } from "@/services/publicService";

const formatoMoneda = new Intl.NumberFormat("es-GT", {
  style: "currency",
  currency: "GTQ",
});

export default function ProductosPublicosPage() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarProductos() {
      try {
        const respuesta = await obtenerProductosPublicos();
        setProductos(respuesta?.data || []);
      } catch (err) {
        setError(err.message || "No se pudieron cargar los productos.");
      } finally {
        setCargando(false);
      }
    }

    cargarProductos();
  }, []);

  return (
    <main className="public-page">
      <section className="container py-5">
        <div className="public-page-header d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
          <div>
            <span className="badge text-bg-light border mb-2">Bonnys</span>
            <h1 className="h2 fw-bold mb-1">Productos</h1>
            <p className="text-secondary mb-0">
              Productos activos disponibles para el cuidado personal.
            </p>
          </div>
          <Link href="/" className="btn btn-outline-primary align-self-md-start">
            Volver al inicio
          </Link>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {cargando ? (
          <div className="py-5 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {productos.map((producto) => (
              <div className="col-12 col-md-6 col-xl-4" key={producto.id_producto}>
                <div className="card h-100 border-0 shadow-sm public-card">
                  {producto.url_foto && (
                    <div
                      className="public-card-image"
                      style={{
                        backgroundImage: `url(${buildAssetUrl(producto.url_foto)})`,
                      }}
                    />
                  )}
                  <div className="card-body d-flex flex-column p-4">
                    <h2 className="h5 fw-bold">{producto.nombre}</h2>
                    <p className="text-secondary flex-grow-1">
                      {producto.descripcion || "Producto disponible en Bonnys."}
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-semibold">
                        {formatoMoneda.format(Number(producto.precio_venta || 0))}
                      </span>
                      <span className="badge text-bg-light border">
                        Stock: {producto.stock_actual}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
