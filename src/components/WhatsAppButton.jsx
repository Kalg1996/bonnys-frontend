const WHATSAPP_NUMBER = "50200000000";
const WHATSAPP_MESSAGE =
  "Hola, quiero más información sobre los servicios de Bonnys";

export default function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE
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
