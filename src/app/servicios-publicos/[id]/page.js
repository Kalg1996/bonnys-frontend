"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import MediaCarousel from "@/components/MediaCarousel";
import { obtenerGaleriaPublicaServicio } from "@/services/galeriaService";
import { obtenerServiciosPublicos } from "@/services/publicService";

const formatoMoneda = new Intl.NumberFormat("es-GT", {
  style: "currency",
  currency: "GTQ",
});

export default function ServicioPublicoDetallePage() {
  const params = useParams();
  const idServicio = params.id;
  const [servicio, setServicio] = useState(null);
  const [galeria, setGaleria] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarDetalle() {
      try {
        const [serviciosResp, galeriaResp] = await Promise.all([
          obtenerServiciosPublicos(),
          obtenerGaleriaPublicaServicio(idServicio),
        ]);
        const encontrado = (serviciosResp?.data || []).find(
          (item) => String(item.id_servicio) === String(idServicio)
        );

        setServicio(encontrado || null);
        setGaleria(galeriaResp?.data || []);
      } catch (err) {
        setError(err.message || "No se pudo cargar el detalle del servicio.");
      } finally {
        setCargando(false);
      }
    }

    cargarDetalle();
  }, [idServicio]);

  return (
    <main className="public-page">
      <section className="container py-5">
        <div className="public-page-header d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
          <div>
            <span className="badge text-bg-light border mb-2">Bonnys</span>
            <h1 className="h2 fw-bold mb-1">
              {servicio?.nombre || "Detalle de servicio"}
            </h1>
            <p className="text-secondary mb-0">
              Galería multimedia y datos del servicio.
            </p>
          </div>
          <div className="d-flex flex-column flex-sm-row gap-2 align-self-md-start">
            <Link href="/servicios-publicos" className="btn btn-outline-secondary">
              Volver
            </Link>
            <Link href="/agendar-cita" className="btn btn-primary">
              Agendar cita
            </Link>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {cargando ? (
          <div className="py-5 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : !servicio ? (
          <div className="alert alert-danger">Servicio no encontrado.</div>
        ) : (
          <>
            <div className="card border-0 shadow-sm public-card mb-4">
              <MediaCarousel
                id={`servicio-detalle-${servicio.id_servicio}`}
                imageUrl={servicio.url_foto}
                videoUrl={servicio.url_video}
                imageAlt={servicio.nombre}
                variant="detail"
              />
              <div className="card-body p-4">
                <h2 className="h4 fw-bold">{servicio.nombre}</h2>
                <p className="text-secondary">
                  {servicio.descripcion || "Servicio disponible en Bonnys."}
                </p>
                <div className="d-flex flex-wrap gap-3">
                  <span className="badge text-bg-light border">
                    {formatoMoneda.format(Number(servicio.precio || 0))}
                  </span>
                  <span className="badge text-bg-light border">
                    {servicio.duracion_minutos} min
                  </span>
                </div>
              </div>
            </div>

            <h2 className="h4 fw-bold mb-3">Galería</h2>
            {galeria.length === 0 ? (
              <p className="text-secondary">Este servicio aún no tiene galería.</p>
            ) : (
              <div className="row g-4">
                {galeria.map((media) => (
                  <div className="col-12 col-md-6 col-xl-4" key={media.id_media}>
                    <div className="card border-0 shadow-sm public-card h-100">
                      <MediaCarousel
                        id={`servicio-publico-media-${media.id_media}`}
                        imageUrl={media.tipo === "IMAGEN" ? media.url : ""}
                        videoUrl={media.tipo === "VIDEO" ? media.url : ""}
                        imageAlt={servicio.nombre}
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
