import Link from "next/link";

const enlaces = [
  { texto: "Dashboard", ruta: "/dashboard" },
  { texto: "Clientes", ruta: "/clientes" },
  { texto: "Servicios", ruta: "/servicios" },
  { texto: "Productos", ruta: "/productos" },
  { texto: "Citas", ruta: "/citas" },
  { texto: "Ingresos", ruta: "/ingresos" },
  { texto: "Gastos", ruta: "/gastos" },
];

export default function Sidebar() {
  return (
    <aside className="dashboard-sidebar bg-white border-end">
      <div className="p-3 p-md-4">
        <p className="text-uppercase small text-secondary fw-semibold mb-3">
          Menú
        </p>
        <nav className="nav nav-pills flex-row flex-md-column gap-2">
          {enlaces.map((enlace) => (
            <Link
              href={enlace.ruta}
              className="nav-link text-dark dashboard-sidebar-link"
              key={enlace.ruta}
            >
              {enlace.texto}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
