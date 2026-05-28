"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CardDashboard from "@/components/CardDashboard";
import { cerrarSesion, obtenerToken, obtenerUsuario } from "@/utils/auth";

const tarjetas = [
  {
    titulo: "Clientes",
    descripcion: "Gestiona la información de tus clientes.",
    ruta: "/clientes",
  },
  {
    titulo: "Servicios",
    descripcion: "Administra los servicios disponibles del salón.",
    ruta: "/servicios",
  },
  {
    titulo: "Productos",
    descripcion: "Controla los productos que ofrece Bonnys.",
    ruta: "/productos",
  },
  {
    titulo: "Citas",
    descripcion: "Organiza la agenda y las próximas atenciones.",
    ruta: "/citas",
  },
  {
    titulo: "Ingresos",
    descripcion: "Consulta el registro de ingresos del negocio.",
    ruta: "/ingresos",
  },
  {
    titulo: "Gastos",
    descripcion: "Revisa los gastos operativos del salón.",
    ruta: "/gastos",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const verificarSesion = window.setTimeout(() => {
      const token = obtenerToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      setUsuario(obtenerUsuario());
      setCargando(false);
    }, 0);

    return () => window.clearTimeout(verificarSesion);
  }, [router]);

  function handleCerrarSesion() {
    cerrarSesion();
    router.replace("/login");
  }

  if (cargando) {
    return (
      <main className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </main>
    );
  }

  const nombre = usuario?.nombre || usuario?.nombre_usuario || "usuario";

  return (
    <main className="min-vh-100 bg-light">
      <section className="container py-4 py-md-5">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <span className="badge text-bg-primary mb-2">Bonnys</span>
            <h1 className="h2 fw-bold mb-1">Hola, {nombre}</h1>
            <p className="text-secondary mb-0">
              Selecciona un módulo para administrar el salón.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={handleCerrarSesion}
          >
            Cerrar sesión
          </button>
        </div>

        <div className="row g-4">
          {tarjetas.map((tarjeta) => (
            <div className="col-12 col-md-6 col-xl-4" key={tarjeta.ruta}>
              <CardDashboard
                titulo={tarjeta.titulo}
                descripcion={tarjeta.descripcion}
                ruta={tarjeta.ruta}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
