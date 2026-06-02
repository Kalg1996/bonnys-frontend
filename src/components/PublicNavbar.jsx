"use client";

import { useEffect } from "react";
import { useState } from "react";
import Link from "next/link";
import { buildAssetUrl } from "@/services/api";
import {
  mezclarConfiguracion,
  obtenerConfiguracionPublica,
} from "@/services/configuracionSitioService";

const enlaces = [
  { texto: "Inicio", ruta: "/" },
  { texto: "Servicios", ruta: "/servicios-publicos" },
  { texto: "Productos", ruta: "/productos-publicos" },
  { texto: "Sobre nosotros", ruta: "/sobre-nosotros" },
];

export default function PublicNavbar() {
  const [configuracion, setConfiguracion] = useState(null);

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

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
    <nav className="navbar navbar-expand-lg public-navbar">
      <div className="container">
        <Link href="/" className="navbar-brand fw-bold d-flex align-items-center gap-2">
          {config.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={buildAssetUrl(config.logo_url)}
              alt={config.nombre_negocio}
              className="public-navbar-logo"
            />
          )}
          {config.nombre_negocio}
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#publicNavbar"
          aria-controls="publicNavbar"
          aria-expanded="false"
          aria-label="Abrir navegación"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="publicNavbar">
          <div className="navbar-nav ms-auto gap-lg-2 align-items-lg-center">
            {enlaces.map((enlace) => (
              <Link href={enlace.ruta} className="nav-link" key={enlace.ruta}>
                {enlace.texto}
              </Link>
            ))}
            <div className="d-flex flex-column flex-lg-row gap-2 ms-lg-2 mt-3 mt-lg-0">
              <Link href="/agendar-cita" className="btn btn-primary btn-sm">
                Agendar cita
              </Link>
              <Link href="/login" className="btn btn-outline-primary btn-sm">
                Login administrador
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
