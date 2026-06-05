export function soloNumeros(value) {
  return String(value || "").replace(/\D/g, "");
}

export function soloEnterosPositivos(value) {
  return soloNumeros(value);
}

export function soloDecimal(value) {
  const limpio = String(value || "")
    .replace(/,/g, ".")
    .replace(/[^\d.]/g, "");
  const partes = limpio.split(".");

  if (partes.length <= 1) return partes[0];

  return `${partes[0]}.${partes.slice(1).join("")}`;
}

export function normalizarCampoNumerico(name, value, reglas = {}) {
  if (reglas.telefonos?.includes(name)) {
    return soloNumeros(value);
  }

  if (reglas.enteros?.includes(name)) {
    return soloEnterosPositivos(value);
  }

  if (reglas.decimales?.includes(name)) {
    return soloDecimal(value);
  }

  return value;
}
