"use client";

import { useEffect } from "react";
import Link from "next/link";

const enlaces = [
  { texto: "Inicio", ruta: "/" },
  { texto: "Servicios", ruta: "/servicios-publicos" },
  { texto: "Productos", ruta: "/productos-publicos" },
  { texto: "Sobre nosotros", ruta: "/sobre-nosotros" },
  { texto: "Agendar cita", ruta: "/agendar-cita" },
];

export default function PublicNavbar() {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return (
    <nav className="navbar navbar-expand-lg public-navbar">
      <div className="container">
        <Link href="/" className="navbar-brand fw-bold">
          Bonnys
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
          <div className="navbar-nav ms-auto gap-lg-2">
            {enlaces.map((enlace) => (
              <Link href={enlace.ruta} className="nav-link" key={enlace.ruta}>
                {enlace.texto}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
