// Unidades de venta de un producto (se eligen al cargar el producto).
// Mantener sincronizado con UNIDADES_VALIDAS en backend/endpoints/productos.js
export const UNIDADES = [
  { valor: "kg", plural: "kilos", nombre: "Kilo", sufijo: "kg" },
  { valor: "lb", plural: "libras", nombre: "Libra", sufijo: "lb" },
  { valor: "unidad", plural: "unidades", nombre: "Unidad", sufijo: "unid." },
  { valor: "docena", plural: "docenas", nombre: "Docena", sufijo: "docena" },
  { valor: "litro", plural: "litros", nombre: "Litro", sufijo: "lt" },
  { valor: "frasco", plural: "frascos", nombre: "Frasco", sufijo: "frasco" },
  { valor: "paquete", plural: "paquetes", nombre: "Paquete", sufijo: "paquete" },
  { valor: "atado", plural: "atados", nombre: "Atado", sufijo: "atado" },
  { valor: "canastilla", plural: "canastillas", nombre: "Canastilla", sufijo: "canastilla" },
  { valor: "bulto", plural: "bultos", nombre: "Bulto", sufijo: "bulto" },
];

export const UNIDAD_POR_DEFECTO = "kg";

export const obtenerUnidad = (valor) =>
  UNIDADES.find((u) => u.valor === valor) || UNIDADES.find((u) => u.valor === UNIDAD_POR_DEFECTO);

/** Texto corto para mostrar junto al precio: "kg", "litro", "docena"... */
export const sufijoUnidad = (producto) => obtenerUnidad(producto?.unidad).sufijo;
