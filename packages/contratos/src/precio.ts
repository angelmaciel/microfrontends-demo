const formato = new Intl.NumberFormat("es-PY", {
  style: "currency",
  currency: "PYG",
  maximumFractionDigits: 0,
});

/** Formatea un monto en guaraníes. Rechaza decimales y negativos: indican un error de datos. */
export function formatearPrecio(guaranies: number): string {
  if (!Number.isInteger(guaranies) || guaranies < 0) {
    throw new RangeError(`Precio inválido: ${guaranies}`);
  }
  return formato.format(guaranies);
}
