// Reglas de ofertas a partir de la etiqueta del producto.
// - "-20%" o "20%"  → oferta con 20% de descuento (el precio guardado ya es el precio final)
// - "Oferta"        → oferta sin porcentaje
// - Otra etiqueta   → no es oferta

/** Porcentaje de descuento (1-90) o null si la etiqueta no tiene uno válido. */
export const obtenerDescuento = (etiqueta) => {
  if (!etiqueta) return null;
  const match = String(etiqueta).match(/(\d{1,2})\s*%/);
  if (!match) return null;
  const valor = Number(match[1]);
  return valor >= 1 && valor <= 90 ? valor : null;
};

export const esOferta = (producto) =>
  obtenerDescuento(producto?.etiqueta) !== null ||
  String(producto?.etiqueta || "").trim().toLowerCase() === "oferta";

/** Precio antes del descuento, redondeado a la centena. null si no hay descuento. */
export const precioAntes = (producto) => {
  const descuento = obtenerDescuento(producto?.etiqueta);
  if (descuento === null) return null;
  const original = Number(producto.precio) / (1 - descuento / 100);
  return Math.round(original / 100) * 100;
};

export const formatoPrecio = (valor) => `$${Number(valor).toLocaleString("es-CO")}`;
