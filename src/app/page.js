import Link from "next/link";

export default function Home() {
  return (
    <main className="home-page d-flex align-items-center">
      <section className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-9 col-lg-7 col-xl-6">
            <div className="text-center bg-white border rounded-3 shadow-sm p-4 p-md-5">
              <span className="badge text-bg-light border mb-3">
                Salón de belleza
              </span>
              <h1 className="display-4 fw-bold text-dark mb-3">Bonnys</h1>
              <p className="lead text-secondary mb-4">
                Sistema web para salón de belleza
              </p>
              <Link href="/login" className="btn btn-primary btn-lg px-4">
                Ir al login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
