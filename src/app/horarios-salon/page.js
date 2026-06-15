"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AlertMessage from "@/components/AlertMessage";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import {
  actualizarHorarioSalon,
  obtenerHorariosSalon,
} from "@/services/horarioSalonService";
import {
  cerrarSesion,
  obtenerToken,
  obtenerUsuario,
} from "@/utils/auth";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { toastError, toastSuccess } from "@/utils/toast";

function normalizarHora(hora) {
  return hora ? String(hora).slice(0, 5) : "";
}

export default function HorariosSalonPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [guardandoId, setGuardandoId] = useState(null);
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

  async function cargarHorarios() {
    setCargandoHorarios(true);
    setError("");

    try {
      const respuesta = await obtenerHorariosSalon();
      setHorarios(
        (respuesta?.data || []).map((horario) => ({
          ...horario,
          hora_inicio: normalizarHora(horario.hora_inicio),
          hora_fin: normalizarHora(horario.hora_fin),
          activo: Boolean(horario.activo),
        }))
      );
    } catch (err) {
      mostrarError(err, "No se pudieron cargar los horarios.");
    } finally {
      setCargandoHorarios(false);
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
      cargarHorarios();
    }, 0);

    return () => window.clearTimeout(verificarSesion);
  }, [router]);

  function handleCerrarSesion() {
    cerrarSesion();
    router.replace("/login");
  }

  function actualizarCampo(idHorario, campo, valor) {
    setHorarios((prevHorarios) =>
      prevHorarios.map((horario) =>
        horario.id_horario === idHorario
          ? { ...horario, [campo]: valor }
          : horario
      )
    );
  }

  async function guardarHorario(horario) {
    setGuardandoId(horario.id_horario);
    setMensaje("");
    setError("");

    try {
      await actualizarHorarioSalon(horario.id_horario, {
        hora_inicio: horario.hora_inicio,
        hora_fin: horario.hora_fin,
        activo: horario.activo,
      });
      mostrarExito(`Horario de ${horario.dia_semana} actualizado correctamente.`);
      await cargarHorarios();
    } catch (err) {
      mostrarError(err, "No se pudo actualizar el horario.");
    } finally {
      setGuardandoId(null);
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

  return (
    <main className="min-vh-100 bg-light">
      <Navbar usuario={usuario} onCerrarSesion={handleCerrarSesion} />

      <div className="dashboard-shell">
        <Sidebar />

        <section className="dashboard-content p-3 p-md-4 p-xl-5">
          <div className="mb-4">
            <span className="badge text-bg-primary mb-2">Horarios</span>
            <h1 className="h2 fw-bold mb-1">Horarios del salón</h1>
            <p className="text-secondary mb-0">
              Configura los días activos y el rango de atención para citas públicas.
            </p>
          </div>

          <AlertMessage type="success" message={mensaje} />
          <AlertMessage type="danger" message={error} />

          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="d-flex align-items-center justify-content-between gap-3 p-4 border-bottom">
                <h2 className="h5 fw-bold mb-0">Semana de atención</h2>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={cargarHorarios}
                  disabled={cargandoHorarios}
                >
                  {cargandoHorarios ? "Actualizando..." : "Actualizar"}
                </button>
              </div>

              {cargandoHorarios ? (
                <div className="p-5 text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Día</th>
                        <th>Hora inicio</th>
                        <th>Hora fin</th>
                        <th>Activo</th>
                        <th className="text-end">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {horarios.map((horario) => (
                        <tr key={horario.id_horario}>
                          <td className="fw-semibold">{horario.dia_semana}</td>
                          <td>
                            <input
                              type="time"
                              className="form-control"
                              value={horario.hora_inicio}
                              onChange={(event) =>
                                actualizarCampo(
                                  horario.id_horario,
                                  "hora_inicio",
                                  event.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="time"
                              className="form-control"
                              value={horario.hora_fin}
                              onChange={(event) =>
                                actualizarCampo(
                                  horario.id_horario,
                                  "hora_fin",
                                  event.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <div className="form-check form-switch">
                              <input
                                id={`activo-${horario.id_horario}`}
                                type="checkbox"
                                className="form-check-input"
                                checked={horario.activo}
                                onChange={(event) =>
                                  actualizarCampo(
                                    horario.id_horario,
                                    "activo",
                                    event.target.checked
                                  )
                                }
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`activo-${horario.id_horario}`}
                              >
                                {horario.activo ? "Abierto" : "Cerrado"}
                              </label>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex justify-content-end">
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => guardarHorario(horario)}
                                disabled={guardandoId === horario.id_horario}
                              >
                                {guardandoId === horario.id_horario
                                  ? "Guardando..."
                                  : "Guardar"}
                              </button>
                            </div>
                          </td>
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
