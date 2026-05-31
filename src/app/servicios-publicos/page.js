"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buildAssetUrl } from "@/services/api";
import { obtenerServiciosPublicos } from "@/services/publicService";

const formatoMoneda = new Intl.NumberFormat("es-GT", {
  style: "currency",
  currency: "GTQ",
});

function construirVideoUrl(urlVideo) {
  if (!urlVideo) return "";

  return urlVideo.startsWith("/uploads")
    ? `http://localhost:3000${urlVideo}`
    : urlVideo;
}

export default function ServiciosPublicosPage() {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarServicios() {
      try {
        const respuesta = await obtenerServiciosPublicos();
        setServicios(respuesta?.data || []);
      } catch (err) {
        setError(err.message || "No se pudieron cargar los servicios.");
      } finally {
        setCargando(false);
      }
    }

    cargarServicios();
  }, []);

  return (
    <main className="public-page">
      <section className="container py-5">
        <div className="public-page-header d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
          <div>
            <span className="badge text-bg-light border mb-2">Bonnys</span>
            <h1 className="h2 fw-bold mb-1">Servicios</h1>
            <p className="text-secondary mb-0">
              Elige el servicio ideal y agenda tu visita.
            </p>
          </div>
          <Link href="/agendar-cita" className="btn btn-primary align-self-md-start">
            Agendar cita
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
            {servicios.map((servicio) => (
              <div className="col-12 col-md-6 col-xl-4" key={servicio.id_servicio}>
                <div className="card h-100 border-0 shadow-sm public-card">
                  {servicio.url_foto && (
                    <div
                      className="public-card-image"
                      style={{
                        backgroundImage: `url(${buildAssetUrl(servicio.url_foto)})`,
                      }}
                    />
                  )}
                  <div className="card-body d-flex flex-column p-4">
                    <h2 className="h5 fw-bold">{servicio.nombre}</h2>
                    <p className="text-secondary flex-grow-1">
                      {servicio.descripcion || "Servicio disponible en Bonnys."}
                    </p>
                    <div className="d-flex justify-content-between mb-3">
                      <span className="fw-semibold">
                        {formatoMoneda.format(Number(servicio.precio || 0))}
                      </span>
                      <span className="text-secondary">
                        {servicio.duracion_minutos} min
                      </span>
                    </div>
                    {servicio.url_video && (
                      <div className="mb-3">
                        <p className="small fw-bold text-secondary mb-2">Video</p>
                        <video controls preload="metadata" className="w-100 rounded">
                          <source src={construirVideoUrl(servicio.url_video)} />
                        </video>
                      </div>
                    )}
                    <Link href="/agendar-cita" className="btn btn-outline-primary">
                      Agendar cita
                    </Link>
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
