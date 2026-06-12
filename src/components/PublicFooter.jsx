"use client";

import Link from "next/link";
import { buildAssetUrl } from "@/services/api";
import { mezclarConfiguracion } from "@/services/configuracionSitioService";
import { obtenerRedesActivas } from "@/components/socialNetworks";

export default function PublicFooter({ configuracion }) {
  const config = mezclarConfiguracion(configuracion);
  const year = new Date().getFullYear();
  const redesActivas = obtenerRedesActivas(configuracion, {
    incluirWhatsapp: false,
  });

  return (
    <footer className="public-footer">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-12 col-lg-4">
            <div className="d-flex align-items-center gap-3 mb-3">
              {config.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={buildAssetUrl(config.logo_url)}
                  alt={config.nombre_negocio}
                  className="public-footer-logo"
                />
              )}
              <div>
                <h2 className="h4 fw-bold mb-1">{config.nombre_negocio}</h2>
                <p className="mb-0 text-white-75">Belleza, cuidado y estilo.</p>
              </div>
            </div>
            <Link href="/login" className="btn btn-outline-light btn-sm">
              Login administrador
            </Link>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <h3 className="h6 text-uppercase fw-bold mb-3">Contacto</h3>
            <p className="mb-2 text-white-75">{config.telefono_principal}</p>
            {config.telefono_secundario && (
              <p className="mb-2 text-white-75">{config.telefono_secundario}</p>
            )}
            <p className="mb-0 text-white-75">{config.correo_contacto}</p>
          </div>

          <div className="col-12 col-md-6 col-lg-2">
            <h3 className="h6 text-uppercase fw-bold mb-3">Redes</h3>
            {redesActivas.length > 0 ? (
              <div className="d-flex flex-column gap-2">
                {redesActivas.map((red) => (
                  <a
                    key={red.key}
                    href={config[red.key]}
                    target="_blank"
                    rel="noreferrer"
                    className="public-footer-social-link"
                    aria-label={red.label}
                  >
                    <span className={`public-footer-social-icon ${red.className}`}>
                      <red.Icon aria-hidden="true" focusable="false" />
                    </span>
                    <span>{red.label}</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="mb-0 text-white-75">Redes pendientes de configurar.</p>
            )}
          </div>

          <div className="col-12 col-lg-3">
            <h3 className="h6 text-uppercase fw-bold mb-3">Ubicación</h3>
            <p className="mb-0 text-white-75">{config.direccion}</p>
          </div>
        </div>

        <div className="public-footer-bottom d-flex flex-column flex-md-row justify-content-between gap-2 mt-5 pt-4">
          <p className="mb-0 text-white-75">
            © {year} {config.nombre_negocio}. Todos los derechos reservados.
          </p>
          <div className="d-flex gap-3">
            <Link href="/servicios-publicos" className="public-footer-link">
              Servicios
            </Link>
            <Link href="/productos-publicos" className="public-footer-link">
              Productos
            </Link>
            <Link href="/agendar-cita" className="public-footer-link">
              Agendar cita
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
