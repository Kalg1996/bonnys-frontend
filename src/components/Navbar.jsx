export default function Navbar({ usuario, onCerrarSesion }) {
  const nombre = usuario?.nombre || usuario?.nombre_usuario || "usuario";

  return (
    <nav className="navbar navbar-expand dashboard-navbar">
      <div className="container-fluid px-3 px-md-4 gap-2">
        <span className="navbar-brand fw-bold mb-0">Bonnys</span>

        <div className="d-flex align-items-center gap-2 gap-sm-3 ms-auto">
          <span className="text-secondary d-none d-sm-inline">
            {nombre}
          </span>
          <button
            type="button"
            className="btn btn-bonnys-outline btn-sm"
            onClick={onCerrarSesion}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
}
