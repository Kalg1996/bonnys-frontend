"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  agendarCitaPublica,
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

export default function AgendarCitaPage() {
  const [servicios, setServicios] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [cargandoServicios, setCargandoServicios] = useState(true);
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

  function handleChange(event) {
    const { name, value } = event.target;

    setFormulario((prevFormulario) => ({
      ...prevFormulario,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setEnviando(true);
    setMensaje("");
    setError("");

    try {
      await agendarCitaPublica({
        ...formulario,
        id_servicio: Number(formulario.id_servicio),
      });

      setMensaje("Tu cita fue solicitada correctamente. Quedó en estado PENDIENTE.");
      setFormulario(formularioInicial);
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

            {mensaje && (
              <div className="alert alert-success" role="alert">
                {mensaje}
              </div>
            )}

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

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

                    <div className="col-12 col-md-4">
                      <label htmlFor="fecha_cita" className="form-label">
                        Fecha
                      </label>
                      <input
                        id="fecha_cita"
                        name="fecha_cita"
                        type="date"
                        className="form-control"
                        value={formulario.fecha_cita}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label htmlFor="hora_inicio" className="form-label">
                        Hora inicio
                      </label>
                      <input
                        id="hora_inicio"
                        name="hora_inicio"
                        type="time"
                        className="form-control"
                        value={formulario.hora_inicio}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label htmlFor="hora_fin" className="form-label">
                        Hora fin
                      </label>
                      <input
                        id="hora_fin"
                        name="hora_fin"
                        type="time"
                        className="form-control"
                        value={formulario.hora_fin}
                        onChange={handleChange}
                        required
                      />
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
                    {enviando ? "Enviando solicitud..." : "Solicitar cita"}
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
