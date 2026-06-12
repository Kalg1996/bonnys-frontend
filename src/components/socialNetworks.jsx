import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";

function tieneValor(valor) {
  return typeof valor === "string" && valor.trim().length > 0;
}

function construirWhatsAppUrl(configuracion) {
  if (!tieneValor(configuracion?.whatsapp_numero)) {
    return null;
  }

  const numero = configuracion.whatsapp_numero.trim();
  const mensaje = configuracion.whatsapp_mensaje_predeterminado || "";

  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

export const REDES_SOCIALES = [
  {
    key: "whatsapp_numero",
    label: "WhatsApp",
    Icon: FaWhatsapp,
    className: "social-whatsapp",
    href: construirWhatsAppUrl,
  },
  {
    key: "facebook_url",
    label: "Facebook",
    Icon: FaFacebookF,
    className: "social-facebook",
  },
  {
    key: "instagram_url",
    label: "Instagram",
    Icon: FaInstagram,
    className: "social-instagram",
  },
  {
    key: "tiktok_url",
    label: "TikTok",
    Icon: FaTiktok,
    className: "social-tiktok",
  },
  {
    key: "youtube_url",
    label: "YouTube",
    Icon: FaYoutube,
    className: "social-youtube",
  },
];

export function obtenerRedesActivas(configuracion, opciones = {}) {
  const { incluirWhatsapp = true } = opciones;

  return REDES_SOCIALES.filter((red) => incluirWhatsapp || red.key !== "whatsapp_numero")
    .map((red) => {
      const href = red.href
        ? red.href(configuracion)
        : tieneValor(configuracion?.[red.key]) && configuracion[red.key].trim();

      if (!href) {
        return null;
      }

      return {
        ...red,
        href,
      };
    })
    .filter(Boolean);
}
