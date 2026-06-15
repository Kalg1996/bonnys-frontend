"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AlertMessage from "@/components/AlertMessage";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { obtenerCitas } from "@/services/citaService";
import { obtenerClientes } from "@/services/clienteService";
import { obtenerGastos } from "@/services/gastoService";
import { obtenerIngresos } from "@/services/ingresoService";
import { obtenerProductos } from "@/services/productoService";
import { obtenerServicios } from "@/services/servicioService";
import { cerrarSesion, obtenerToken, obtenerUsuario } from "@/utils/auth";

const formatoMoneda = new Intl.NumberFormat("es-GT", {
  style: "currency",
  currency: "GTQ",
});

function sumarMontos(items) {
  return items.reduce((total, item) => total + Number(item.monto || 0), 0);
}

function contarPorEstado(citas, estado) {
  return citas.filter((cita) => cita.estado === estado).length;
}

function contarStockBajo(productos) {
  return productos.filter(
    (producto) =>
      Number(producto.stock_actual) <= Number(producto.stock_minimo)
  ).length;
}

export default function DashboardPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [error, setError] = useState("");
  const [metricas, setMetricas] = useState({
    clientes: [],
    servicios: [],
    productos: [],
    citas: [],
    ingresos: [],
    gastos: [],
  });

  async function cargarMetricas() {
    setCargandoDatos(true);
    setError("");

    try {
      const [
        clientesResp,
        serviciosResp,
        productosResp,
        citasResp,
        ingresosResp,
        gastosResp,
      ] = await Promise.all([
        obtenerClientes(),
        obtenerServicios(),
        obtenerProductos(),
        obtenerCitas(),
        obtenerIngresos(),
        obtenerGastos(),
      ]);

      setMetricas({
        clientes: clientesResp?.data || [],
        servicios: serviciosResp?.data || [],
        productos: productosResp?.data || [],
        citas: citasResp?.data || [],
        ingresos: ingresosResp?.data || [],
        gastos: gastosResp?.data || [],
      });
    } catch (err) {
      setError(err.message || "No se pudieron cargar los datos del dashboard.");
    } finally {
      setCargandoDatos(false);
    }
  }

  useEffect(() => {
    const verificarSesion = window.setTimeout(() => {
      const token = obtenerToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      setUsuario(obtenerUsuario());
      setCargando(false);
      cargarMetricas();
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
  const totalIngresos = sumarMontos(metricas.ingresos);
  const totalGastos = sumarMontos(metricas.gastos);
  const ganancia = totalIngresos - totalGastos;
  const productosStockBajo = contarStockBajo(metricas.productos);
  const citasPendientes = contarPorEstado(metricas.citas, "PENDIENTE");
  const citasConfirmadas = contarPorEstado(metricas.citas, "CONFIRMADA");
  const citasFinalizadas = contarPorEstado(metricas.citas, "FINALIZADA");
  const citasCanceladas = contarPorEstado(metricas.citas, "CANCELADA");

  const tarjetas = [
    {
      id: "clientes",
      titulo: "Clientes",
      icono: "👥",
      valor: metricas.clientes.length,
      descripcion: "Clientes registrados",
      ruta: "/clientes",
    },
    {
      id: "servicios",
      titulo: "Servicios",
      icono: "✂️",
      valor: metricas.servicios.length,
      descripcion: "Servicios disponibles",
      ruta: "/servicios",
    },
    {
      id: "productos",
      titulo: "Productos",
      icono: "🛍️",
      valor: metricas.productos.length,
      descripcion: "Productos registrados",
      ruta: "/productos",
    },
    {
      id: "citas",
      titulo: "Citas",
      icono: "📅",
      valor: metricas.citas.length,
      descripcion: "Citas registradas",
      ruta: "/citas",
    },
    {
      id: "ingresos",
      titulo: "Ingresos",
      icono: "💰",
      valor: formatoMoneda.format(totalIngresos),
      descripcion: "Ingresos acumulados",
      ruta: "/ingresos",
    },
    {
      id: "gastos",
      titulo: "Gastos",
      icono: "💸",
      valor: formatoMoneda.format(totalGastos),
      descripcion: "Gastos acumulados",
      ruta: "/gastos",
    },
    {
      id: "ganancia",
      titulo: "Ganancia",
      icono: "📈",
      valor: formatoMoneda.format(ganancia),
      descripcion: "Ingresos menos gastos",
      ruta: "/ingresos",
    },
  ];

  const reportes = [
    { etiqueta: "Ingresos totales", valor: formatoMoneda.format(totalIngresos) },
    { etiqueta: "Gastos totales", valor: formatoMoneda.format(totalGastos) },
    { etiqueta: "Ganancia", valor: formatoMoneda.format(ganancia) },
    { etiqueta: "Productos con stock bajo", valor: productosStockBajo },
    { etiqueta: "Citas pendientes", valor: citasPendientes },
    { etiqueta: "Citas confirmadas", valor: citasConfirmadas },
    { etiqueta: "Citas finalizadas", valor: citasFinalizadas },
    { etiqueta: "Citas canceladas", valor: citasCanceladas },
  ];

  return (
    <main className="min-vh-100 bg-light">
      <Navbar usuario={usuario} onCerrarSesion={handleCerrarSesion} />

      <div className="dashboard-shell">
        <Sidebar />

        <section className="dashboard-content p-3 p-md-4 p-xl-5">
          <div className="mb-4">
            <span className="badge text-bg-primary mb-2">Dashboard</span>
            <h1 className="h2 fw-bold admin-page-title mb-1">Hola, {nombre}</h1>
            <p className="text-secondary mb-0">
              Resumen general del salón con datos reales de la API.
            </p>
          </div>

          <AlertMessage type="danger" message={error} />

          {cargandoDatos && (
            <div className="alert alert-light border d-flex align-items-center gap-2">
              <div className="spinner-border spinner-border-sm text-primary" />
              <span>Cargando métricas...</span>
            </div>
          )}

          <div className="row g-4">
            {tarjetas.map((tarjeta) => (
              <div className="col-12 col-md-6 col-xl-4" key={tarjeta.id}>
                <div className="card h-100 border-0 shadow-sm metric-card">
                  <div className="card-body d-flex flex-column p-4">
                    <div className="metric-icon d-flex align-items-center justify-content-center fw-bold mb-3">
                      <span aria-hidden="true">{tarjeta.icono}</span>
                    </div>
                    <p className="text-secondary mb-1">{tarjeta.titulo}</p>
                    <h2 className="h3 fw-bold mb-2">{tarjeta.valor}</h2>
                    <p className="text-secondary flex-grow-1 mb-4">
                      {tarjeta.descripcion}
                    </p>
                    <Link href={tarjeta.ruta} className="btn btn-outline-primary">
                      Ver {tarjeta.titulo}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card border-0 shadow-sm mt-4">
            <div className="card-body p-4">
              <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-4">
                <div>
                  <h2 className="h4 fw-bold mb-1">Reportes básicos</h2>
                  <p className="text-secondary mb-0">
                    Indicadores rápidos para control operativo.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm align-self-md-start"
                  onClick={cargarMetricas}
                  disabled={cargandoDatos}
                >
                  Actualizar
                </button>
              </div>

              <div className="row g-3">
                {reportes.map((reporte) => (
                  <div className="col-12 col-sm-6 col-xl-3" key={reporte.etiqueta}>
                    <div className="border rounded-3 p-3 h-100 bg-light report-card">
                      <p className="text-secondary small mb-1">
                        {reporte.etiqueta}
                      </p>
                      <p className="h5 fw-bold mb-0">{reporte.valor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
