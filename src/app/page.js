import Link from "next/link";

export default function Home() {
  return (
    <main className="public-home">
      <section className="container py-5">
        <div className="row align-items-center g-5 min-vh-100 py-lg-4">
          <div className="col-12 col-lg-7">
            <span className="badge text-bg-light border mb-3">
              Salón de belleza
            </span>
            <h1 className="display-3 fw-bold text-dark mb-3">Bonnys</h1>
            <p className="lead text-secondary mb-4">
              Belleza, cuidado personal y experiencias pensadas para que te
              sientas renovada. Explora nuestros servicios, productos y agenda
              tu próxima cita en línea.
            </p>

            <div className="d-flex flex-column flex-sm-row flex-wrap gap-3">
              <Link href="/servicios-publicos" className="btn btn-primary btn-lg">
                Ver servicios
              </Link>
              <Link href="/productos-publicos" className="btn btn-outline-primary btn-lg">
                Ver productos
              </Link>
              <Link href="/agendar-cita" className="btn btn-accent btn-lg">
                Agendar cita
              </Link>
              <Link href="/login" className="btn btn-outline-secondary btn-lg">
                Login administrador
              </Link>
            </div>
          </div>

          <div className="col-12 col-lg-5">
            <div className="public-hero-panel bg-white border shadow-sm p-4 p-md-5">
              <p className="text-uppercase small text-primary fw-semibold mb-2">
                Bonnys Beauty Studio
              </p>
              <h2 className="h3 fw-bold mb-3">Agenda fácil, atención cálida.</h2>
              <p className="text-secondary mb-0">
                Consulta servicios activos, revisa productos disponibles y
                solicita tu cita sin crear una cuenta.
              </p>
            </div>
          </div>
        </div>

        <div className="row g-4 pb-5">
          <div className="col-12 col-md-4">
            <div className="public-feature-card h-100 p-4">
              <div className="public-feature-icon d-flex align-items-center justify-content-center fw-bold mb-3">
                S
              </div>
              <h2 className="h5 fw-bold">Servicios</h2>
              <p className="text-secondary mb-0">
                Tratamientos y cuidados activos para elegir antes de visitar el salón.
              </p>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="public-feature-card h-100 p-4">
              <div className="public-feature-icon d-flex align-items-center justify-content-center fw-bold mb-3">
                P
              </div>
              <h2 className="h5 fw-bold">Productos</h2>
              <p className="text-secondary mb-0">
                Catálogo disponible con precios y stock para cuidado personal.
              </p>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="public-feature-card h-100 p-4">
              <div className="public-feature-icon d-flex align-items-center justify-content-center fw-bold mb-3">
                A
              </div>
              <h2 className="h5 fw-bold">Agenda</h2>
              <p className="text-secondary mb-0">
                Solicitud de citas en línea sin necesidad de iniciar sesión.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
