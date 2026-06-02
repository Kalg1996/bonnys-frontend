"use client";

import { useEffect, useState } from "react";
import {
  mezclarConfiguracion,
  obtenerConfiguracionPublica,
} from "@/services/configuracionSitioService";

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
  const href = `https://wa.me/${config.whatsapp_numero}?text=${encodeURIComponent(
    config.whatsapp_mensaje_predeterminado
  )}`;

  return (
    <a
      href={href}
      className="whatsapp-float"
      target="_blank"
      rel="noreferrer"
      aria-label="Contactar por WhatsApp"
    >
      WhatsApp
    </a>
  );
}
