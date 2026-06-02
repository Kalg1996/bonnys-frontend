"use client";

import { useEffect } from "react";
import { buildAssetUrl } from "@/services/api";
import {
  getThemeStyle,
  mezclarConfiguracion,
  obtenerConfiguracionPublica,
} from "@/services/configuracionSitioService";

function obtenerBackground(config) {
  if (config.fondo_tipo === "GRADIENTE") {
    return `linear-gradient(${config.fondo_gradiente_direccion || "135deg"}, ${config.fondo_color_1}, ${config.fondo_color_2}, ${config.fondo_color_3})`;
  }

  return config.fondo_color_1 || "#FFF1F2";
}

function aplicarConfiguracion(configuracion) {
  const config = mezclarConfiguracion(configuracion);
  const root = document.documentElement;
  const themeStyle = getThemeStyle(config);

  Object.entries(themeStyle).forEach(([variable, valor]) => {
    root.style.setProperty(variable, valor);
  });

  root.style.setProperty("--bonnys-bg-color-1", config.fondo_color_1);
  root.style.setProperty("--bonnys-bg-color-2", config.fondo_color_2);
  root.style.setProperty("--bonnys-bg-color-3", config.fondo_color_3);

  document.body.style.background = "";
  document.body.style.backgroundImage = "";
  document.body.style.backgroundColor = "";
  document.body.style.backgroundSize = "";
  document.body.style.backgroundPosition = "";
  document.body.style.backgroundAttachment = "";

  if (config.fondo_tipo === "IMAGEN" && config.fondo_imagen_url) {
    const urlCompleta = buildAssetUrl(config.fondo_imagen_url);

    root.style.setProperty("--bonnys-bg", `url(${urlCompleta})`);
    document.body.style.backgroundImage = `url(${urlCompleta})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";
    return;
  }

  const background = obtenerBackground(config);

  root.style.setProperty("--bonnys-bg", background);

  if (config.fondo_tipo === "GRADIENTE") {
    document.body.style.background = background;
    return;
  }

  document.body.style.backgroundColor = config.fondo_color_1 || "#FFF1F2";
}

export default function SiteTheme() {
  useEffect(() => {
    async function aplicarTema() {
      let configuracion = null;

      try {
        const respuesta = await obtenerConfiguracionPublica();
        configuracion = respuesta?.data || null;
      } catch {
        configuracion = null;
      }

      aplicarConfiguracion(configuracion);
    }

    function aplicarTemaActualizado(event) {
      aplicarConfiguracion(event.detail || null);
    }

    aplicarTema();
    window.addEventListener("bonnys-theme-updated", aplicarTemaActualizado);

    return () => {
      window.removeEventListener("bonnys-theme-updated", aplicarTemaActualizado);
    };
  }, []);

  return null;
}
