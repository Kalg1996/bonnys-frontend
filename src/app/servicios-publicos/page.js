"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MediaCarousel from "@/components/MediaCarousel";
import { obtenerServiciosPublicos } from "@/services/publicService";

const formatoMoneda = new Intl.NumberFormat("es-GT", {
  style: "currency",
  currency: "GTQ",
});

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
                  <MediaCarousel
                    id={`servicio-publico-${servicio.id_servicio}`}
                    imageUrl={servicio.url_foto}
                    videoUrl={servicio.url_video}
                    imageAlt={servicio.nombre}
                  />
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
                    <div className="d-grid gap-2">
                      <Link
                        href={`/servicios-publicos/${servicio.id_servicio}`}
                        className="btn btn-outline-primary"
                      >
                        Ver galería
                      </Link>
                      <Link href="/agendar-cita" className="btn btn-primary">
                        Agendar cita
                      </Link>
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
