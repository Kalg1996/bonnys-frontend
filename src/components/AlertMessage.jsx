export default function AlertMessage({ type = "info", message, children }) {
  const content = message || children;

  if (!content) return null;

  const titles = {
    success: "Operación completada",
    danger: "No se pudo completar",
    warning: "Atención",
    info: "Información",
  };

  return (
    <div className={`alert alert-${type} d-flex gap-3 align-items-start`} role="alert">
      <span className="alert-message-dot" aria-hidden="true" />
      <div>
        <p className="fw-bold mb-1">{titles[type] || titles.info}</p>
        <p className="mb-0">{content}</p>
      </div>
    </div>
  );
}
