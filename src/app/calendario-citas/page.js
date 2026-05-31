"use client";

import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import { useRouter } from "next/navigation";
import AlertMessage from "@/components/AlertMessage";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { actualizarCita, obtenerCitas } from "@/services/citaService";
import {
  cerrarSesion,
  obtenerToken,
  obtenerUsuario,
} from "@/utils/auth";

const ESTADOS = ["CONFIRMADA", "FINALIZADA", "CANCELADA", "NO_ASISTIO"];
const VISTAS = ["dia", "semana", "mes"];
const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const estadoClases = {
  PENDIENTE: "appointment-status-pending",
  CONFIRMADA: "appointment-status-confirmed",
  FINALIZADA: "appointment-status-finished",
  CANCELADA: "appointment-status-cancelled",
  NO_ASISTIO: "appointment-status-muted",
};

function formatearFecha(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parsearFecha(fecha) {
  if (!fecha) return null;

  const [year, month, day] = String(fecha).slice(0, 10).split("-").map(Number);

  return new Date(year, month - 1, day);
}

function fechaCita(cita) {
  return String(cita.fecha_cita || "").slice(0, 10);
}

function horaCorta(hora) {
  return String(hora || "").slice(0, 5);
}

function sumarDias(date, dias) {
  const nuevaFecha = new Date(date);
  nuevaFecha.setDate(nuevaFecha.getDate() + dias);

  return nuevaFecha;
}

function inicioSemana(date) {
  const inicio = new Date(date);
  inicio.setDate(inicio.getDate() - inicio.getDay());

  return inicio;
}

function obtenerDiasMes(date) {
  const inicioMes = new Date(date.getFullYear(), date.getMonth(), 1);
  const finMes = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const inicioGrid = inicioSemana(inicioMes);
  const dias = [];

  for (let i = 0; i < 42; i += 1) {
    const dia = sumarDias(inicioGrid, i);
    dias.push({
      date: dia,
      key: formatearFecha(dia),
      esMesActual: dia.getMonth() === date.getMonth(),
      esHoy: formatearFecha(dia) === formatearFecha(new Date()),
    });
  }

  return dias.filter((dia, index) => {
    if (index < 35) return true;

    return dia.date <= finMes || dia.esMesActual;
  });
}

function nombreMes(date) {
  return new Intl.DateTimeFormat("es-GT", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function ordenarCitas(citas) {
  return [...citas].sort((a, b) =>
    `${horaCorta(a.hora_inicio)}-${a.id_cita}`.localeCompare(
      `${horaCorta(b.hora_inicio)}-${b.id_cita}`
    )
  );
}

export default function CalendarioCitasPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [citas, setCitas] = useState([]);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [cargandoCitas, setCargandoCitas] = useState(false);
  const [guardandoEstado, setGuardandoEstado] = useState("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [vista, setVista] = useState("mes");
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function cargarCitas() {
    setCargandoCitas(true);
    setError("");

    try {
      const respuesta = await obtenerCitas();
      setCitas(respuesta?.data || []);
    } catch (err) {
      setError(err.message || "No se pudieron cargar las citas.");
    } finally {
      setCargandoCitas(false);
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
      cargarCitas();
    }, 0);

    return () => window.clearTimeout(verificarSesion);
  }, [router]);

  const citasPorFecha = useMemo(() => {
    return citas.reduce((acc, cita) => {
      const fecha = fechaCita(cita);
      acc[fecha] = acc[fecha] ? [...acc[fecha], cita] : [cita];
      return acc;
    }, {});
  }, [citas]);

  function obtenerClaseDiaCalendario(date) {
    const key = formatearFecha(date);

    return citasPorFecha[key]?.length ? "datepicker-day-has-appointments" : "";
  }

  const fechaKey = formatearFecha(fechaSeleccionada);
  const citasDelDia = ordenarCitas(citasPorFecha[fechaKey] || []);
  const diasSemana = Array.from({ length: 7 }, (_, index) =>
    sumarDias(inicioSemana(fechaSeleccionada), index)
  );
  const diasMes = obtenerDiasMes(fechaSeleccionada);

  function handleCerrarSesion() {
    cerrarSesion();
    router.replace("/login");
  }

  function seleccionarFecha(date) {
    if (!date) return;

    setFechaSeleccionada(date);
  }

  async function cambiarEstado(cita, estado) {
    setGuardandoEstado(`${cita.id_cita}-${estado}`);
    setMensaje("");
    setError("");

    try {
      await actualizarCita(cita.id_cita, { estado });
      setMensaje(`Cita actualizada a ${estado}.`);
      await cargarCitas();
      setCitaSeleccionada((prevCita) =>
        prevCita?.id_cita === cita.id_cita
          ? { ...prevCita, estado }
          : prevCita
      );
    } catch (err) {
      setError(err.message || "No se pudo actualizar el estado de la cita.");
    } finally {
      setGuardandoEstado("");
    }
  }

  function renderCitaPill(cita, compacta = false) {
    return (
      <button
        type="button"
        className={`appointment-event ${
          estadoClases[cita.estado] || estadoClases.PENDIENTE
        } ${compacta ? "appointment-event-compact" : ""}`}
        key={cita.id_cita}
        onClick={() => setCitaSeleccionada(cita)}
      >
        <span className="fw-bold">{horaCorta(cita.hora_inicio)}</span>
        <span>{cita.cliente || "Cliente"}</span>
        {!compacta && <small>{cita.servicio || "Servicio"}</small>}
      </button>
    );
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
          <div className="d-flex flex-column flex-xl-row justify-content-between gap-3 mb-4">
            <div>
              <span className="badge text-bg-primary mb-2">Calendario</span>
              <h1 className="h2 fw-bold mb-1">Calendario de citas</h1>
              <p className="text-secondary mb-0">
                Consulta citas por día, semana o mes y actualiza estados rápidamente.
              </p>
            </div>

            <div className="d-flex flex-column flex-sm-row gap-2 align-self-xl-start">
              <div className="btn-group" role="group" aria-label="Vista calendario">
                {VISTAS.map((opcion) => (
                  <button
                    type="button"
                    className={`btn ${
                      vista === opcion ? "btn-primary" : "btn-outline-primary"
                    }`}
                    key={opcion}
                    onClick={() => setVista(opcion)}
                  >
                    {opcion === "dia"
                      ? "Día"
                      : opcion === "semana"
                        ? "Semana"
                        : "Mes"}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={cargarCitas}
                disabled={cargandoCitas}
              >
                {cargandoCitas ? "Actualizando..." : "Actualizar"}
              </button>
            </div>
          </div>

          <AlertMessage type="success" message={mensaje} />
          <AlertMessage type="danger" message={error} />

          <div className="row g-4">
            <div className="col-12 col-xl-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-3">
                  <DatePicker
                    selected={fechaSeleccionada}
                    onChange={seleccionarFecha}
                    inline
                    calendarClassName="bonnys-datepicker"
                    dayClassName={obtenerClaseDiaCalendario}
                  />
                </div>
              </div>
            </div>

            <div className="col-12 col-xl-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-3 p-md-4">
                  <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-3">
                    <div>
                      <h2 className="h4 fw-bold text-capitalize mb-1">
                        {vista === "mes"
                          ? nombreMes(fechaSeleccionada)
                          : vista === "semana"
                            ? "Semana seleccionada"
                            : formatearFecha(fechaSeleccionada)}
                      </h2>
                      <p className="text-secondary mb-0">
                        {cargandoCitas ? "Cargando citas..." : `${citas.length} citas registradas`}
                      </p>
                    </div>
                    <span className="badge text-bg-light border align-self-md-start">
                      {fechaKey}
                    </span>
                  </div>

                  {vista === "dia" && (
                    <div className="appointment-day-list">
                      {citasDelDia.length === 0 ? (
                        <p className="text-secondary mb-0">
                          No hay citas para este día.
                        </p>
                      ) : (
                        citasDelDia.map((cita) => renderCitaPill(cita))
                      )}
                    </div>
                  )}

                  {vista === "semana" && (
                    <div className="appointment-week-grid">
                      {diasSemana.map((dia) => {
                        const key = formatearFecha(dia);
                        const citasDia = ordenarCitas(citasPorFecha[key] || []);

                        return (
                          <div className="appointment-week-day" key={key}>
                            <button
                              type="button"
                              className="appointment-day-header"
                              onClick={() => {
                                setFechaSeleccionada(dia);
                                setVista("dia");
                              }}
                            >
                              <span>{DIAS_SEMANA[dia.getDay()]}</span>
                              <strong>{dia.getDate()}</strong>
                            </button>
                            <div className="d-grid gap-2">
                              {citasDia.length === 0 ? (
                                <span className="text-secondary small">Sin citas</span>
                              ) : (
                                citasDia.map((cita) => renderCitaPill(cita, true))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {vista === "mes" && (
                    <div className="appointment-month-grid">
                      {DIAS_SEMANA.map((dia) => (
                        <div className="appointment-month-name" key={dia}>
                          {dia}
                        </div>
                      ))}
                      {diasMes.map((dia) => {
                        const citasDia = ordenarCitas(citasPorFecha[dia.key] || []);

                        return (
                          <button
                            type="button"
                            className={`appointment-month-day ${
                              dia.esMesActual ? "" : "appointment-month-day-muted"
                            } ${dia.esHoy ? "appointment-month-day-today" : ""}`}
                            key={dia.key}
                            onClick={() => {
                              setFechaSeleccionada(dia.date);
                              setVista("dia");
                            }}
                          >
                            <span className="fw-bold">{dia.date.getDate()}</span>
                            <span className="text-secondary small">
                              {citasDia.length} cita{citasDia.length === 1 ? "" : "s"}
                            </span>
                            <div className="appointment-month-dots">
                              {citasDia.slice(0, 4).map((cita) => (
                                <span
                                  className={`appointment-dot ${
                                    estadoClases[cita.estado] || estadoClases.PENDIENTE
                                  }`}
                                  key={cita.id_cita}
                                />
                              ))}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-xl-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <h2 className="h5 fw-bold mb-3">Detalle de cita</h2>

                  {!citaSeleccionada ? (
                    <p className="text-secondary mb-0">
                      Selecciona una cita del calendario para ver el detalle.
                    </p>
                  ) : (
                    <div className="d-grid gap-3">
                      <div>
                        <span
                          className={`appointment-state-badge ${
                            estadoClases[citaSeleccionada.estado] ||
                            estadoClases.PENDIENTE
                          }`}
                        >
                          {citaSeleccionada.estado}
                        </span>
                      </div>
                      <div>
                        <p className="text-secondary small mb-1">Cliente</p>
                        <p className="fw-bold mb-0">{citaSeleccionada.cliente}</p>
                      </div>
                      <div>
                        <p className="text-secondary small mb-1">Servicio</p>
                        <p className="fw-bold mb-0">{citaSeleccionada.servicio}</p>
                      </div>
                      <div>
                        <p className="text-secondary small mb-1">Usuario</p>
                        <p className="fw-bold mb-0">{citaSeleccionada.usuario}</p>
                      </div>
                      <div className="row g-2">
                        <div className="col-12">
                          <p className="text-secondary small mb-1">Fecha</p>
                          <p className="fw-bold mb-0">{fechaCita(citaSeleccionada)}</p>
                        </div>
                        <div className="col-6">
                          <p className="text-secondary small mb-1">Inicio</p>
                          <p className="fw-bold mb-0">
                            {horaCorta(citaSeleccionada.hora_inicio)}
                          </p>
                        </div>
                        <div className="col-6">
                          <p className="text-secondary small mb-1">Fin</p>
                          <p className="fw-bold mb-0">
                            {horaCorta(citaSeleccionada.hora_fin)}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-secondary small mb-1">Observaciones</p>
                        <p className="mb-0">
                          {citaSeleccionada.observaciones || "Sin observaciones"}
                        </p>
                      </div>

                      <div className="border-top pt-3">
                        <p className="fw-bold mb-2">Acciones rápidas</p>
                        <div className="d-grid gap-2">
                          {ESTADOS.map((estado) => (
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm"
                              key={estado}
                              disabled={
                                citaSeleccionada.estado === estado ||
                                guardandoEstado === `${citaSeleccionada.id_cita}-${estado}`
                              }
                              onClick={() => cambiarEstado(citaSeleccionada, estado)}
                            >
                              {guardandoEstado === `${citaSeleccionada.id_cita}-${estado}`
                                ? "Guardando..."
                                : `Cambiar a ${estado}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
