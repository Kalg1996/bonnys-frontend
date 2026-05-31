import Link from "next/link";

export default function NotFound() {
  return (
    <main className="public-page min-vh-100 d-flex align-items-center">
      <section className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-9 col-lg-7">
            <div className="public-page-header text-center">
              <span className="badge text-bg-light border mb-3">Bonnys</span>
              <h1 className="display-5 fw-bold mb-3">Página no encontrada</h1>
              <p className="lead text-secondary mb-4">
                La página que buscas no existe o fue movida.
              </p>
              <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                <Link href="/" className="btn btn-primary btn-lg">
                  Volver al inicio
                </Link>
                <Link href="/login" className="btn btn-outline-primary btn-lg">
                  Login administrador
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
