"use client";

import { useEffect } from "react";
import { buildAssetUrl } from "@/services/api";
import { obtenerConfiguracionPublica } from "@/services/configuracionSitioService";

export default function DynamicFavicon() {
  useEffect(() => {
    async function actualizarFavicon() {
      try {
        const respuesta = await obtenerConfiguracionPublica();
        const faviconUrl = respuesta?.data?.favicon_url;

        if (!faviconUrl) return;

        const hrefBase = buildAssetUrl(faviconUrl);
        const version = respuesta?.data?.fecha_actualizacion || Date.now();
        const href = `${hrefBase}${hrefBase.includes("?") ? "&" : "?"}v=${encodeURIComponent(
          version
        )}`;
        let link = document.querySelector("link[rel='icon']");

        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }

        link.href = href;
      } catch {
        // Keep the default favicon if configuration is unavailable.
      }
    }

    actualizarFavicon();
  }, []);

  return null;
}
