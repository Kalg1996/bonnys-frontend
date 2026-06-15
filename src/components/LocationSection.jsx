"use client";

import { useEffect, useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import {
  mezclarConfiguracion,
  obtenerConfiguracionPublica,
} from "@/services/configuracionSitioService";

export default function LocationSection() {
  const [configuracion, setConfiguracion] = useState(null);

  useEffect(() => {
    async function cargarConfiguracion() {
      try {
        const respuesta = await obtenerConfiguracionPublica();
        setConfiguracion(respuesta?.data || null);
      } catch {
        setConfiguracion(null);
      }
    }

    cargarConfiguracion();
  }, []);

  const config = mezclarConfiguracion(configuracion);

  return (
    <section className="py-5">
      <div className="public-page-header">
        <div className="row g-4 align-items-center">
          <div className="col-12 col-lg-5">
            <span className="badge text-bg-light border mb-2 d-inline-flex align-items-center gap-1">
              <FaMapMarkerAlt className="location-word-icon" aria-hidden="true" />
              Ubicación
            </span>
            <h2 className="h3 fw-bold mb-3">Encuéntranos</h2>
            <p className="text-secondary mb-2">
              Visítanos en nuestro salón. Puedes cambiar esta ubicación desde la
              configuración del sitio.
            </p>
            <p className="fw-semibold mb-0">{config.direccion}</p>
          </div>
          <div className="col-12 col-lg-7">
            {config.google_maps_url ? (
              <iframe
                src={config.google_maps_url}
                className="location-map"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de Bonnys"
              />
            ) : (
              <div className="location-placeholder d-flex align-items-center justify-content-center text-center p-4">
                <div>
                  <p className="fw-bold mb-1 d-inline-flex align-items-center justify-content-center gap-2">
                    <FaMapMarkerAlt className="location-word-icon" aria-hidden="true" />
                    Ubicación pendiente de configurar
                  </p>
                  <p className="text-secondary mb-0">
                    Agrega aquí el iframe real de Google Maps cuando esté disponible.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
