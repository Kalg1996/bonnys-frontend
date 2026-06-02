"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AlertMessage from "@/components/AlertMessage";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { buildAssetUrl } from "@/services/api";
import {
  CONFIGURACION_DEFAULT,
  actualizarConfiguracionSitio,
  obtenerConfiguracionAdmin,
} from "@/services/configuracionSitioService";
import {
  subirFaviconConfiguracion,
  subirLogoConfiguracion,
  subirPortadaConfiguracion,
} from "@/services/uploadService";
import {
  cerrarSesion,
  obtenerToken,
  obtenerUsuario,
} from "@/utils/auth";

const CAMPOS_TEXTO = [
  ["telefono_principal", "Teléfono principal"],
  ["telefono_secundario", "Teléfono secundario"],
  ["correo_contacto", "Correo contacto"],
  ["whatsapp_numero", "WhatsApp número"],
  ["whatsapp_mensaje_predeterminado", "Mensaje WhatsApp"],
  ["facebook_url", "Facebook"],
  ["instagram_url", "Instagram"],
  ["tiktok_url", "TikTok"],
  ["youtube_url", "YouTube"],
  ["direccion", "Dirección"],
  ["google_maps_url", "Google Maps URL"],
  ["titulo_portada", "Título portada"],
  ["subtitulo_portada", "Subtítulo portada"],
  ["meta_title", "Meta title"],
  ["meta_description", "Meta description"],
];

export default function ConfiguracionPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [configuracion, setConfiguracion] = useState(CONFIGURACION_DEFAULT);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function cargarConfiguracion() {
    setCargando(true);
    setError("");

    try {
      const respuesta = await obtenerConfiguracionAdmin();
      setConfiguracion({
        ...CONFIGURACION_DEFAULT,
        ...(respuesta?.data || {}),
      });
    } catch (err) {
      setError(err.message || "No se pudo cargar la configuración.");
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
      cargarConfiguracion();
    }, 0);

    return () => window.clearTimeout(verificarSesion);
  }, [router]);

  function handleCerrarSesion() {
    cerrarSesion();
    router.replace("/login");
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setConfiguracion((prevConfiguracion) => ({
      ...prevConfiguracion,
      [name]: value,
    }));
  }

  async function subirArchivo(tipo, file) {
    if (!file) return;

    setSubiendo(tipo);
    setMensaje("");
    setError("");

    try {
      const acciones = {
        logo_url: subirLogoConfiguracion,
        portada_url: subirPortadaConfiguracion,
        favicon_url: subirFaviconConfiguracion,
      };
      const respuesta = await acciones[tipo](file);
      setConfiguracion((prevConfiguracion) => ({
        ...prevConfiguracion,
        [tipo]: respuesta?.data?.url || "",
      }));
      setMensaje("Archivo subido correctamente. Guarda los cambios para aplicarlo.");
    } catch (err) {
      setError(err.message || "No se pudo subir el archivo.");
    } finally {
      setSubiendo("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setGuardando(true);
    setMensaje("");
    setError("");

    try {
      const respuesta = await actualizarConfiguracionSitio(configuracion);
      setConfiguracion({
        ...CONFIGURACION_DEFAULT,
        ...(respuesta?.data || {}),
      });
      setMensaje("Configuración actualizada correctamente.");
    } catch (err) {
      setError(err.message || "No se pudo guardar la configuración.");
    } finally {
      setGuardando(false);
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
            <span className="badge text-bg-primary mb-2">Configuración</span>
            <h1 className="h2 fw-bold mb-1">Configuración del sitio</h1>
            <p className="text-secondary mb-0">
              Administra identidad visual, contacto, redes, ubicación y textos públicos.
            </p>
          </div>

          <AlertMessage type="success" message={mensaje} />
          <AlertMessage type="danger" message={error} />

          {cargando ? (
            <div className="p-5 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-4">
                      <h2 className="h5 fw-bold mb-3">Identidad visual</h2>
                      <div className="row g-3">
                        <div className="col-12 col-md-6">
                          <label className="form-label" htmlFor="nombre_negocio">
                            Nombre del negocio
                          </label>
                          <input
                            id="nombre_negocio"
                            name="nombre_negocio"
                            className="form-control"
                            value={configuracion.nombre_negocio}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        {[
                          ["logo_url", "Logo"],
                          ["portada_url", "Portada"],
                          ["favicon_url", "Favicon"],
                        ].map(([campo, label]) => (
                          <div className="col-12 col-md-6" key={campo}>
                            <label className="form-label" htmlFor={campo}>
                              {label}
                            </label>
                            <input
                              id={campo}
                              name={campo}
                              className="form-control mb-2"
                              value={configuracion[campo] || ""}
                              onChange={handleChange}
                            />
                            <input
                              type="file"
                              className="form-control"
                              accept={campo === "favicon_url" ? ".ico,.png,.svg" : ".jpg,.jpeg,.png,.webp"}
                              onChange={(event) => subirArchivo(campo, event.target.files?.[0])}
                              disabled={subiendo === campo}
                            />
                            {configuracion[campo] && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={buildAssetUrl(configuracion[campo])}
                                alt={label}
                                className="config-preview mt-2"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-4">
                      <h2 className="h5 fw-bold mb-3">Colores</h2>
                      <div className="row g-3">
                        {[
                          ["color_principal", "Principal"],
                          ["color_secundario", "Secundario"],
                          ["color_acento", "Acento"],
                        ].map(([campo, label]) => (
                          <div className="col-12 col-md-4" key={campo}>
                            <label className="form-label" htmlFor={campo}>
                              {label}
                            </label>
                            <div className="d-flex gap-2">
                              <input
                                id={campo}
                                name={campo}
                                type="color"
                                className="form-control form-control-color"
                                value={configuracion[campo] || "#B91C1C"}
                                onChange={handleChange}
                              />
                              <input
                                name={campo}
                                className="form-control"
                                value={configuracion[campo] || ""}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {[
                  ["Contacto", CAMPOS_TEXTO.slice(0, 5)],
                  ["Redes sociales", CAMPOS_TEXTO.slice(5, 9)],
                  ["Ubicación", CAMPOS_TEXTO.slice(9, 11)],
                  ["Portada pública", CAMPOS_TEXTO.slice(11, 13)],
                  ["SEO", CAMPOS_TEXTO.slice(13, 15)],
                ].map(([titulo, campos]) => (
                  <div className="col-12" key={titulo}>
                    <div className="card border-0 shadow-sm">
                      <div className="card-body p-4">
                        <h2 className="h5 fw-bold mb-3">{titulo}</h2>
                        <div className="row g-3">
                          {campos.map(([campo, label]) => (
                            <div className="col-12 col-md-6" key={campo}>
                              <label className="form-label" htmlFor={campo}>
                                {label}
                              </label>
                              {campo.includes("description") ||
                              campo.includes("mensaje") ||
                              campo.includes("subtitulo") ||
                              campo === "direccion" ? (
                                <textarea
                                  id={campo}
                                  name={campo}
                                  className="form-control"
                                  rows="3"
                                  value={configuracion[campo] || ""}
                                  onChange={handleChange}
                                />
                              ) : (
                                <input
                                  id={campo}
                                  name={campo}
                                  className="form-control"
                                  value={configuracion[campo] || ""}
                                  onChange={handleChange}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 mt-4"
                disabled={guardando || Boolean(subiendo)}
              >
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
