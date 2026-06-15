"use client";

import { useEffect } from "react";
import { useState } from "react";
import Link from "next/link";
import { FaHome } from "react-icons/fa";
import { buildAssetUrl } from "@/services/api";
import {
  mezclarConfiguracion,
  obtenerConfiguracionPublica,
} from "@/services/configuracionSitioService";

const enlaces = [
  { texto: "Inicio", ruta: "/", icono: FaHome },
  { texto: "Servicios", ruta: "/servicios-publicos" },
  { texto: "Productos", ruta: "/productos-publicos" },
  { texto: "Galería", ruta: "/#galeria" },
  { texto: "Promociones", ruta: "/#promociones" },
  { texto: "Nosotros", ruta: "/sobre-nosotros" },
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
            {enlaces.map((enlace) => {
              const Icono = enlace.icono;

              return (
                <Link
                  href={enlace.ruta}
                  className={`nav-link ${Icono ? "public-navbar-home-link" : ""}`}
                  aria-label={Icono ? enlace.texto : undefined}
                  title={Icono ? enlace.texto : undefined}
                  key={enlace.ruta}
                >
                  {Icono ? <Icono aria-hidden="true" focusable="false" /> : enlace.texto}
                </Link>
              );
            })}
            <Link href="/agendar-cita" className="nav-link">
              Agendar cita
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
