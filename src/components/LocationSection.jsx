export const LOCATION_CONFIG = {
  direccion: "Bonnys Beauty Studio, Guatemala",
  texto:
    "Visítanos en nuestro salón. La ubicación exacta se puede configurar cuando tengas el enlace real de Google Maps.",
  mapaUrl: "",
};

export default function LocationSection() {
  return (
    <section className="py-5">
      <div className="public-page-header">
        <div className="row g-4 align-items-center">
          <div className="col-12 col-lg-5">
            <span className="badge text-bg-light border mb-2">Ubicación</span>
            <h2 className="h3 fw-bold mb-3">Encuéntranos</h2>
            <p className="text-secondary mb-2">{LOCATION_CONFIG.texto}</p>
            <p className="fw-semibold mb-0">{LOCATION_CONFIG.direccion}</p>
          </div>
          <div className="col-12 col-lg-7">
            {LOCATION_CONFIG.mapaUrl ? (
              <iframe
                src={LOCATION_CONFIG.mapaUrl}
                className="location-map"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de Bonnys"
              />
            ) : (
              <div className="location-placeholder d-flex align-items-center justify-content-center text-center p-4">
                <div>
                  <p className="fw-bold mb-1">Ubicación pendiente de configurar</p>
                  <p className="text-secondary mb-0">
                    Agrega aquí el iframe real de Google Maps cuando esté disponible.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
