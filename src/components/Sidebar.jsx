"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const enlaces = [
  { texto: "Dashboard", ruta: "/dashboard" },
  { texto: "Clientes", ruta: "/clientes" },
  { texto: "Servicios", ruta: "/servicios" },
  { texto: "Productos", ruta: "/productos" },
  { texto: "Citas", ruta: "/citas" },
  { texto: "Calendario de citas", ruta: "/calendario-citas" },
  { texto: "Ingresos", ruta: "/ingresos" },
  { texto: "Gastos", ruta: "/gastos" },
  { texto: "Testimonios", ruta: "/testimonios" },
  { texto: "Promociones", ruta: "/promociones" },
  { texto: "Galería de trabajos", ruta: "/galeria-trabajos" },
  { texto: "Horarios del salón", ruta: "/horarios-salon" },
  { texto: "Almacenamiento", ruta: "/almacenamiento" },
  { texto: "Configuración", ruta: "/configuracion" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="dashboard-sidebar bg-white border-end">
      <div className="p-3 p-md-4">
        <p className="text-uppercase small text-secondary fw-bold mb-3">
          Menú
        </p>
        <nav className="nav nav-pills flex-row flex-md-column gap-2">
          {enlaces.map((enlace) => (
            <Link
              href={enlace.ruta}
              className={`nav-link dashboard-sidebar-link ${
                pathname === enlace.ruta ? "active" : ""
              }`}
              key={enlace.ruta}
            >
              {enlace.texto}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
