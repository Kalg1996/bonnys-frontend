"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import AlertMessage from "@/components/AlertMessage";
import {
  agendarCitaPublica,
  obtenerDisponibilidad,
  obtenerServiciosPublicos,
} from "@/services/publicService";

const formularioInicial = {
  nombre: "",
  apellido: "",
  telefono1: "",
  telefono2: "",
  correo: "",
  direccion: "",
  id_servicio: "",
  fecha_cita: "",
  hora_inicio: "",
  hora_fin: "",
  observaciones: "",
};

function formatearFecha(date) {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parsearFecha(fecha) {
  if (!fecha) return null;

  const [year, month, day] = fecha.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export default function AgendarCitaPage() {
  const [servicios, setServicios] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [horarios, setHorarios] = useState([]);
  const [avisoDisponibilidad, setAvisoDisponibilidad] = useState("");
  const [cargandoServicios, setCargandoServicios] = useState(true);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarServicios() {
      try {
        const respuesta = await obtenerServiciosPublicos();
        setServicios(respuesta?.data || []);
      } catch (err) {
        setError(err.message || "No se pudieron cargar los servicios.");
      } finally {
        setCargandoServicios(false);
      }
    }

    cargarServicios();
  }, []);

  useEffect(() => {
    async function cargarHorarios() {
      if (!formulario.id_servicio || !formulario.fecha_cita) {
        setHorarios([]);
        setAvisoDisponibilidad("");
        return;
      }

      setCargandoHorarios(true);
      setError("");
      setHorarios([]);
      setAvisoDisponibilidad("");

      try {
        const respuesta = await obtenerDisponibilidad(
          formulario.fecha_cita,
          formulario.id_servicio
        );
        const horariosRespuesta = respuesta?.data?.horarios || [];
        setHorarios(horariosRespuesta);
        setAvisoDisponibilidad(respuesta?.data?.mensaje || "");
      } catch (err) {
        setError(err.message || "No se pudieron cargar los horarios.");
      } finally {
        setCargandoHorarios(false);
      }
    }

    cargarHorarios();
  }, [formulario.id_servicio, formulario.fecha_cita]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormulario((prevFormulario) => {
      const debeLimpiarHorario =
        name === "id_servicio" || name === "fecha_cita";

      return {
        ...prevFormulario,
        [name]: value,
        ...(debeLimpiarHorario ? { hora_inicio: "", hora_fin: "" } : {}),
      };
    });
  }

  function handleFechaChange(date) {
    setFormulario((prevFormulario) => ({
      ...prevFormulario,
      fecha_cita: formatearFecha(date),
      hora_inicio: "",
      hora_fin: "",
    }));
  }

  function seleccionarHorario(horario) {
    if (!horario.disponible) return;

    setFormulario((prevFormulario) => ({
      ...prevFormulario,
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin,
    }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setEnviando(true);
    setMensaje("");
    setError("");

    try {
      if (!formulario.id_servicio) {
        throw new Error("Selecciona un servicio.");
      }

      if (!formulario.fecha_cita) {
        throw new Error("Selecciona una fecha.");
      }

      if (!formulario.hora_inicio || !formulario.hora_fin) {
        throw new Error("Selecciona un horario disponible.");
      }

      if (!formulario.nombre.trim()) {
        throw new Error("Ingresa tu nombre.");
      }

      if (!formulario.apellido.trim()) {
        throw new Error("Ingresa tu apellido.");
      }

      if (!formulario.telefono1.trim()) {
        throw new Error("Ingresa tu teléfono principal.");
      }

      await agendarCitaPublica({
        ...formulario,
        id_servicio: Number(formulario.id_servicio),
      });

      setMensaje("Tu cita fue solicitada correctamente. Quedó en estado PENDIENTE.");
      setFormulario(formularioInicial);
      setHorarios([]);
      setAvisoDisponibilidad("");
    } catch (err) {
      setError(err.message || "No se pudo agendar la cita.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="public-page">
      <section className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-9 col-xl-8">
            <div className="public-page-header d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
              <div>
                <span className="badge text-bg-light border mb-2">Bonnys</span>
                <h1 className="h2 fw-bold mb-1">Agendar cita</h1>
                <p className="text-secondary mb-0">
                  Completa tus datos y solicita tu cita sin iniciar sesión.
                </p>
              </div>
              <Link href="/" className="btn btn-outline-primary align-self-md-start">
                Volver al inicio
              </Link>
            </div>

            <AlertMessage type="success" message={mensaje} />
            <AlertMessage type="danger" message={error} />

            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 p-md-5">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label htmlFor="nombre" className="form-label">
                        Nombre
                      </label>
                      <input
                        id="nombre"
                        name="nombre"
                        type="text"
                        className="form-control"
                        value={formulario.nombre}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label htmlFor="apellido" className="form-label">
                        Apellido
                      </label>
                      <input
                        id="apellido"
                        name="apellido"
                        type="text"
                        className="form-control"
                        value={formulario.apellido}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label htmlFor="telefono1" className="form-label">
                        Teléfono principal
                      </label>
                      <input
                        id="telefono1"
                        name="telefono1"
                        type="tel"
                        className="form-control"
                        value={formulario.telefono1}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label htmlFor="telefono2" className="form-label">
                        Teléfono alterno
                      </label>
                      <input
                        id="telefono2"
                        name="telefono2"
                        type="tel"
                        className="form-control"
                        value={formulario.telefono2}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label htmlFor="correo" className="form-label">
                        Correo
                      </label>
                      <input
                        id="correo"
                        name="correo"
                        type="email"
                        className="form-control"
                        value={formulario.correo}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label htmlFor="direccion" className="form-label">
                        Dirección
                      </label>
                      <input
                        id="direccion"
                        name="direccion"
                        type="text"
                        className="form-control"
                        value={formulario.direccion}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12">
                      <label htmlFor="id_servicio" className="form-label">
                        Servicio
                      </label>
                      <select
                        id="id_servicio"
                        name="id_servicio"
                        className="form-select"
                        value={formulario.id_servicio}
                        onChange={handleChange}
                        disabled={cargandoServicios}
                        required
                      >
                        <option value="">Seleccionar servicio</option>
                        {servicios.map((servicio) => (
                          <option
                            value={servicio.id_servicio}
                            key={servicio.id_servicio}
                          >
                            {servicio.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12">
                      <div className="appointment-calendar-panel">
                        <div className="d-flex flex-column flex-lg-row gap-4 align-items-lg-start">
                          <div className="appointment-calendar-copy">
                            <p className="fw-bold mb-1">Elige una fecha</p>
                            <p className="text-secondary small mb-3">
                              Después selecciona un horario disponible para completar tu cita.
                            </p>
                            {formulario.fecha_cita && (
                              <span className="badge text-bg-primary">
                                Fecha: {formulario.fecha_cita}
                              </span>
                            )}
                          </div>
                          <DatePicker
                            selected={parsearFecha(formulario.fecha_cita)}
                            onChange={handleFechaChange}
                            minDate={new Date()}
                            inline
                            calendarClassName="bonnys-datepicker"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="appointment-slots-panel">
                        <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-3">
                          <div>
                            <p className="fw-bold mb-1">Horarios disponibles</p>
                            <p className="text-secondary small mb-0">
                              Selecciona un servicio y una fecha para ver el calendario.
                            </p>
                          </div>
                          {formulario.hora_inicio && formulario.hora_fin && (
                            <span className="badge text-bg-primary align-self-md-start">
                              {formulario.hora_inicio} - {formulario.hora_fin}
                            </span>
                          )}
                        </div>

                        {cargandoHorarios ? (
                          <div className="d-flex align-items-center gap-2 text-secondary">
                            <div className="spinner-border spinner-border-sm text-primary" />
                            <span>Cargando horarios...</span>
                          </div>
                        ) : !formulario.id_servicio || !formulario.fecha_cita ? (
                          <AlertMessage
                            type="info"
                            message="Elige servicio y fecha para consultar disponibilidad."
                          />
                        ) : avisoDisponibilidad ? (
                          <AlertMessage
                            type="warning"
                            message={avisoDisponibilidad}
                          />
                        ) : horarios.length === 0 ? (
                          <AlertMessage
                            type="warning"
                            message="No hay horarios disponibles para esta fecha."
                          />
                        ) : (
                          <div className="appointment-slots-grid">
                            {horarios.map((horario) => {
                              const seleccionado =
                                formulario.hora_inicio === horario.hora_inicio &&
                                formulario.hora_fin === horario.hora_fin;

                              return (
                                <button
                                  type="button"
                                  className={`btn appointment-slot-btn ${
                                    seleccionado
                                      ? "btn-primary"
                                      : horario.disponible
                                        ? "btn-outline-primary"
                                        : "btn-outline-secondary"
                                  }`}
                                  key={`${horario.hora_inicio}-${horario.hora_fin}`}
                                  disabled={!horario.disponible}
                                  onClick={() => seleccionarHorario(horario)}
                                >
                                  {horario.hora_inicio} - {horario.hora_fin}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-12">
                      <label htmlFor="observaciones" className="form-label">
                        Observaciones
                      </label>
                      <textarea
                        id="observaciones"
                        name="observaciones"
                        className="form-control"
                        rows="3"
                        value={formulario.observaciones}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 mt-4"
                    disabled={enviando}
                  >
                    {enviando ? "Agendando..." : "Solicitar cita"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
