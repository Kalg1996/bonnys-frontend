"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import MediaCarousel from "@/components/MediaCarousel";
import { obtenerGaleriaPublicaProducto } from "@/services/galeriaService";
import { obtenerProductosPublicos } from "@/services/publicService";

const formatoMoneda = new Intl.NumberFormat("es-GT", {
  style: "currency",
  currency: "GTQ",
});

export default function ProductoPublicoDetallePage() {
  const params = useParams();
  const idProducto = params.id;
  const [producto, setProducto] = useState(null);
  const [galeria, setGaleria] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarDetalle() {
      try {
        const [productosResp, galeriaResp] = await Promise.all([
          obtenerProductosPublicos(),
          obtenerGaleriaPublicaProducto(idProducto),
        ]);
        const encontrado = (productosResp?.data || []).find(
          (item) => String(item.id_producto) === String(idProducto)
        );

        setProducto(encontrado || null);
        setGaleria(galeriaResp?.data || []);
      } catch (err) {
        setError(err.message || "No se pudo cargar el detalle del producto.");
      } finally {
        setCargando(false);
      }
    }

    cargarDetalle();
  }, [idProducto]);

  return (
    <main className="public-page">
      <section className="container py-5">
        <div className="public-page-header d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
          <div>
            <span className="badge text-bg-light border mb-2">Bonnys</span>
            <h1 className="h2 fw-bold mb-1">
              {producto?.nombre || "Detalle de producto"}
            </h1>
            <p className="text-secondary mb-0">
              Galería multimedia y datos del producto.
            </p>
          </div>
          <Link href="/productos-publicos" className="btn btn-outline-secondary align-self-md-start">
            Volver
          </Link>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {cargando ? (
          <div className="py-5 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : !producto ? (
          <div className="alert alert-danger">Producto no encontrado.</div>
        ) : (
          <>
            <div className="card border-0 shadow-sm public-card mb-4">
              <MediaCarousel
                id={`producto-detalle-${producto.id_producto}`}
                imageUrl={producto.url_foto}
                videoUrl={producto.url_video}
                imageAlt={producto.nombre}
                variant="detail"
              />
              <div className="card-body p-4">
                <h2 className="h4 fw-bold">{producto.nombre}</h2>
                <p className="text-secondary">
                  {producto.descripcion || "Producto disponible en Bonnys."}
                </p>
                <div className="d-flex flex-wrap gap-3">
                  <span className="badge text-bg-light border">
                    {formatoMoneda.format(Number(producto.precio_venta || 0))}
                  </span>
                  <span className="badge text-bg-light border">
                    Stock: {producto.stock_actual}
                  </span>
                </div>
              </div>
            </div>

            <h2 className="h4 fw-bold mb-3">Galería</h2>
            {galeria.length === 0 ? (
              <p className="text-secondary">Este producto aún no tiene galería.</p>
            ) : (
              <div className="row g-4">
                {galeria.map((media) => (
                  <div className="col-12 col-md-6 col-xl-4" key={media.id_media}>
                    <div className="card border-0 shadow-sm public-card h-100">
                      <MediaCarousel
                        id={`producto-publico-media-${media.id_media}`}
                        imageUrl={media.tipo === "IMAGEN" ? media.url : ""}
                        videoUrl={media.tipo === "VIDEO" ? media.url : ""}
                        imageAlt={producto.nombre}
                      />
                      <div className="card-body p-3">
                        <span className="badge text-bg-light border">{media.tipo}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
