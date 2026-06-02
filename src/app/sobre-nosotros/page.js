import Link from "next/link";
import LocationSection from "@/components/LocationSection";
import PublicNavbar from "@/components/PublicNavbar";
import WhatsAppButton from "@/components/WhatsAppButton";

const valores = [
  "Atención cálida",
  "Higiene y cuidado",
  "Puntualidad",
  "Belleza con confianza",
];

export default function SobreNosotrosPage() {
  return (
    <main className="public-page">
      <PublicNavbar />
      <section className="container py-5">
        <div className="public-page-header mb-5">
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-8">
              <span className="badge text-bg-light border mb-2">Sobre nosotros</span>
              <h1 className="display-5 fw-bold mb-3">Bonnys Beauty Studio</h1>
              <p className="lead text-secondary mb-0">
                Un salón de belleza creado para que cada visita se sienta cercana,
                profesional y especial.
              </p>
            </div>
            <div className="col-12 col-lg-4">
              <div className="public-feature-card p-4 text-center">
                <p className="h1 fw-bold text-primary mb-1">B</p>
                <p className="text-secondary mb-0">Belleza, agenda y cuidado en un solo lugar.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-12 col-lg-6">
            <div className="public-feature-card h-100 p-4">
              <h2 className="h4 fw-bold">Nuestra historia</h2>
              <p className="text-secondary mb-0">
                Bonnys nace con la idea de ofrecer un espacio cómodo, elegante y
                confiable para el cuidado personal. Combinamos servicios de belleza
                con una experiencia organizada para que puedas agendar y visitar el
                salón sin complicaciones.
              </p>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="public-feature-card h-100 p-4">
              <h2 className="h4 fw-bold">Atención al cliente</h2>
              <p className="text-secondary mb-0">
                Nos enfocamos en escuchar tus necesidades, recomendar opciones
                adecuadas y cuidar cada detalle antes, durante y después de tu cita.
              </p>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-12 col-md-6">
            <div className="public-feature-card h-100 p-4">
              <h2 className="h4 fw-bold">Misión</h2>
              <p className="text-secondary mb-0">
                Brindar servicios de belleza con calidad, calidez y confianza para
                que cada cliente se sienta renovada.
              </p>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="public-feature-card h-100 p-4">
              <h2 className="h4 fw-bold">Visión</h2>
              <p className="text-secondary mb-0">
                Ser un salón reconocido por su servicio profesional, su atención
                humana y su experiencia digital sencilla.
              </p>
            </div>
          </div>
        </div>

        <section className="mb-5">
          <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
            <div>
              <span className="badge text-bg-light border mb-2">Valores</span>
              <h2 className="h3 fw-bold mb-0">Lo que guía nuestro trabajo</h2>
            </div>
            <div className="d-flex flex-column flex-sm-row gap-2">
              <Link href="/agendar-cita" className="btn btn-primary">
                Agendar cita
              </Link>
              <Link href="/" className="btn btn-outline-primary">
                Volver al inicio
              </Link>
            </div>
          </div>
          <div className="row g-3">
            {valores.map((valor) => (
              <div className="col-12 col-sm-6 col-lg-3" key={valor}>
                <div className="public-feature-card p-4 h-100">
                  <div className="public-feature-icon d-flex align-items-center justify-content-center fw-bold mb-3">
                    {valor.slice(0, 1)}
                  </div>
                  <p className="fw-bold mb-0">{valor}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <LocationSection />
      </section>
      <WhatsAppButton />
    </main>
  );
}
