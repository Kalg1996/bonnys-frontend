import Link from "next/link";

export default function CardDashboard({ titulo, descripcion, ruta }) {
  return (
    <div className="card h-100 border-0 shadow-sm">
      <div className="card-body d-flex flex-column p-4">
        <h2 className="h5 fw-bold mb-2">{titulo}</h2>
        <p className="text-secondary flex-grow-1 mb-4">{descripcion}</p>
        <Link href={ruta} className="btn btn-outline-primary w-100">
          Ver {titulo}
        </Link>
      </div>
    </div>
  );
}
