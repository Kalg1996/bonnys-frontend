"use client";

import { useEffect, useState } from "react";
import {
  mezclarConfiguracion,
  obtenerConfiguracionPublica,
} from "@/services/configuracionSitioService";
import { obtenerRedesActivas } from "@/components/socialNetworks";

export default function WhatsAppButton() {
  const [configuracion, setConfiguracion] = useState(null);

  useEffect(() => {
    async function cargarConfiguracion() {
      try {
        const respuesta = await obtenerConfiguracionPublica();
        setConfiguracion(respuesta?.data || null);
      } catch {
        setConfiguracion(null);
      }
    }

    cargarConfiguracion();
  }, []);

  const config = mezclarConfiguracion(configuracion);
  const redes = obtenerRedesActivas(configuracion && config);

  return (
    <div className="social-float" aria-label="Redes sociales">
      {redes.map((red) => (
        <a
          href={red.href}
          className={`social-float-link ${red.className}`}
          target="_blank"
          rel="noreferrer"
          aria-label={red.label}
          title={red.label}
          key={red.label}
        >
          <red.Icon aria-hidden="true" focusable="false" />
        </a>
      ))}
    </div>
  );
}
