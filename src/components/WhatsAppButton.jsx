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
  const whatsappHref = `https://wa.me/${config.whatsapp_numero}?text=${encodeURIComponent(
    config.whatsapp_mensaje_predeterminado
  )}`;
  const redes = [
    {
      href: whatsappHref,
      label: "WhatsApp",
      texto: "WA",
      className: "social-float-link social-float-whatsapp",
    },
    config.facebook_url && {
      href: config.facebook_url,
      label: "Facebook",
      texto: "f",
      className: "social-float-link social-float-facebook",
    },
    config.instagram_url && {
      href: config.instagram_url,
      label: "Instagram",
      texto: "IG",
      className: "social-float-link social-float-instagram",
    },
    config.tiktok_url && {
      href: config.tiktok_url,
      label: "TikTok",
      texto: "TT",
      className: "social-float-link social-float-tiktok",
    },
  ].filter(Boolean);

  return (
    <div className="social-float" aria-label="Redes sociales">
      {redes.map((red) => (
        <a
          href={red.href}
          className={red.className}
          target="_blank"
          rel="noreferrer"
          aria-label={red.label}
          title={red.label}
          key={red.label}
        >
          {red.texto}
        </a>
      ))}
    </div>
  );
}
