"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AlertMessage from "@/components/AlertMessage";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import {
  eliminarArchivosNoUsados,
  obtenerArchivosNoUsados,
  obtenerResumenAlmacenamiento,
} from "@/services/almacenamientoService";
import { cerrarSesion, obtenerToken, obtenerUsuario } from "@/utils/auth";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { toastError, toastSuccess } from "@/utils/toast";

const estadoConfig = {
  NORMAL: {
    label: "Normal",
    progress: "bg-success",
    badge: "text-bg-success",
  },
  ADVERTENCIA: {
    label: "Advertencia",
    progress: "bg-warning",
    badge: "text-bg-warning",
  },
  ALERTA: {
    label: "Alerta",
    progress: "bg-orange",
    badge: "text-bg-warning",
  },
  LIMITE_ALCANZADO: {
    label: "Límite alcanzado",
    progress: "bg-danger",
    badge: "text-bg-danger",
  },
};

function formatoBytes(bytes) {
  return new Intl.NumberFormat("es-GT").format(Number(bytes || 0));
}

export default function AlmacenamientoPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [archivosNoUsados, setArchivosNoUsados] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  function mostrarExito(mensajeExito) {
    setMensaje(mensajeExito);
    toastSuccess(mensajeExito);
  }

  function mostrarError(err, fallback) {
    const mensajeError = getErrorMessage(err, fallback);
    setError(mensajeError);
    toastError(mensajeError);
  }

  async function cargarAlmacenamiento() {
    setCargando(true);
    setError("");

    try {
      const [respuestaResumen, respuestaArchivos] = await Promise.all([
        obtenerResumenAlmacenamiento(),
        obtenerArchivosNoUsados(),
      ]);

      setResumen(respuestaResumen?.data || null);
      setArchivosNoUsados(respuestaArchivos?.data || null);
    } catch (err) {
      mostrarError(err, "No se pudo cargar el almacenamiento.");
    } finally {
      setCargando(false);
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
      setCargandoSesion(false);
      cargarAlmacenamiento();
    }, 0);

    return () => window.clearTimeout(verificarSesion);
  }, [router]);

  function handleCerrarSesion() {
    cerrarSesion();
    router.replace("/login");
  }

  async function handleEliminarNoUsados() {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar los archivos no usados? Esta acción no se puede deshacer."
    );

    if (!confirmar) return;

    setEliminando(true);
    setMensaje("");
    setError("");

    try {
      const respuesta = await eliminarArchivosNoUsados();
      const data = respuesta?.data;
      mostrarExito(
        `Se eliminaron ${data?.eliminados || 0} archivos y se liberaron ${
          data?.espacioLiberadoMb || 0
        } MB.`
      );
      await cargarAlmacenamiento();
    } catch (err) {
      mostrarError(err, "No se pudieron eliminar los archivos no usados.");
    } finally {
      setEliminando(false);
    }
  }

  if (cargandoSesion) {
    return (
      <main className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </main>
    );
  }

  const config = estadoConfig[resumen?.estado] || estadoConfig.NORMAL;
  const porcentaje = Math.min(100, Number(resumen?.porcentajeUso || 0));
  const archivos = archivosNoUsados?.archivos || [];

  return (
    <main className="min-vh-100 bg-light">
      <Navbar usuario={usuario} onCerrarSesion={handleCerrarSesion} />

      <div className="dashboard-shell">
        <Sidebar />

        <section className="dashboard-content p-3 p-md-4 p-xl-5">
          <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
            <div>
              <span className="badge text-bg-primary mb-2">Almacenamiento</span>
              <h1 className="h2 fw-bold mb-1">Control de almacenamiento</h1>
              <p className="text-secondary mb-0">
                Revisa el uso de archivos, encuentra contenido no usado y libera espacio.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-outline-primary align-self-lg-start"
              onClick={cargarAlmacenamiento}
              disabled={cargando}
            >
              {cargando ? "Actualizando..." : "Actualizar"}
            </button>
          </div>

          <AlertMessage type="success" message={mensaje} />
          <AlertMessage type="danger" message={error} />

          <div className="row g-4 mb-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
                    <div>
                      <h2 className="h5 fw-bold mb-1">Uso actual</h2>
                      <p className="text-secondary mb-0">
                        Las subidas nuevas se bloquean únicamente si se supera el límite.
                      </p>
                    </div>
                    <span className={`badge align-self-md-start ${config.badge}`}>
                      {config.label}
                    </span>
                  </div>

                  <div className="progress storage-progress mb-3" role="progressbar">
                    <div
                      className={`progress-bar ${config.progress}`}
                      style={{ width: `${porcentaje}%` }}
                    >
                      {porcentaje}%
                    </div>
                  </div>

                  <div className="row g-3">
                    <StorageMetric label="Límite" value={`${resumen?.limiteGb ?? 0} GB`} />
                    <StorageMetric label="Usado" value={`${resumen?.usadoGb ?? 0} GB`} />
                    <StorageMetric label="Disponible" value={`${resumen?.disponibleGb ?? 0} GB`} />
                    <StorageMetric label="Bytes usados" value={formatoBytes(resumen?.usadoBytes)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <h2 className="h5 fw-bold mb-3">Archivos no usados</h2>
                  <p className="display-6 fw-bold text-primary mb-1">
                    {archivosNoUsados?.cantidad ?? 0}
                  </p>
                  <p className="text-secondary mb-4">
                    {archivosNoUsados?.totalBytes
                      ? `${formatoBytes(archivosNoUsados.totalBytes)} bytes detectados`
                      : "No hay espacio pendiente de liberar."}
                  </p>
                  <button
                    type="button"
                    className="btn btn-danger w-100"
                    onClick={handleEliminarNoUsados}
                    disabled={eliminando || archivos.length === 0}
                  >
                    {eliminando ? "Eliminando..." : "Eliminar archivos no usados"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h2 className="h5 fw-bold mb-3">Detalle de archivos no usados</h2>

              {cargando ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : archivos.length === 0 ? (
                <div className="alert alert-info mb-0">
                  No se encontraron archivos no usados.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Ruta</th>
                        <th>Tamaño</th>
                        <th>Bytes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {archivos.map((archivo) => (
                        <tr key={archivo.ruta}>
                          <td className="text-break">{archivo.ruta}</td>
                          <td>{archivo.tamanoMb} MB</td>
                          <td>{formatoBytes(archivo.tamanoBytes)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StorageMetric({ label, value }) {
  return (
    <div className="col-12 col-sm-6 col-lg-3">
      <div className="storage-metric p-3 h-100">
        <p className="text-secondary small mb-1">{label}</p>
        <p className="h5 fw-bold mb-0">{value}</p>
      </div>
    </div>
  );
}
