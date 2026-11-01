import React, { memo, useState } from "react";
import { Link } from "react-router-dom";

// Datos fijos por ahora: la unidad no cambia el precio ni lo que se agrega al carrito
const UNIDADES = [
  { nombre: "Libra", sufijo: "lb" },
  { nombre: "Kilo", sufijo: "kg" },
  { nombre: "Bulto", sufijo: "bulto" },
];

const Producto = ({ producto, agregarAlCarrito }) => {
  const [unidad, setUnidad] = useState("Kilo");

  const handleAgregar = (e) => {
    e.preventDefault();
    if (producto.stock > 0) {
      agregarAlCarrito(producto);
    }
  };

  const sufijoUnidad = UNIDADES.find((u) => u.nombre === unidad)?.sufijo;

  const agotado = producto.stock <= 0;
  const pocasUnidades = producto.stock > 0 && producto.stock <= 5;

  const stockBadge = agotado
    ? "bg-red-100 text-red-800"
    : pocasUnidades
    ? "bg-[#FBD9C9] text-[#6B2A0E]"
    : "bg-[#E3F1E7] text-[#14532D]";

  const stockTexto = agotado
    ? "Agotado"
    : pocasUnidades
    ? `Quedan ${producto.stock}`
    : `${producto.stock} disp.`;

  // Etiquetas con "-" (ej. "-20%") se tratan como oferta
  const etiquetaColor = producto.etiqueta?.includes("-")
    ? "bg-[#FBD9C9] text-[#6B2A0E]"
    : "bg-[#F6D77A] text-[#4A3500]";

  const vendedor = [
    producto.vendedor_nombres?.split(" ")[0],
    producto.vendedor_apellidos?.split(" ")[0],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#E1E8DA] bg-white transition-shadow duration-300 hover:shadow-md">
      {/* Imagen + nombre + vendedor: llevan al detalle */}
      <Link to={`/producto/${producto.id}`} className="flex flex-col">
        <div className="group relative overflow-hidden bg-[#DCE6D3]">
          {producto.etiqueta && (
            <span
              className={`absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 text-[11px] font-bold ${etiquetaColor}`}
            >
              {producto.etiqueta}
            </span>
          )}

          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-48"
          />

          {agotado && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60">
              <span className="rounded-lg bg-[#17261D] px-4 py-2 text-sm font-bold tracking-widest text-white">
                AGOTADO
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 px-4 pt-4">
          <h3 className="line-clamp-2 text-base font-bold leading-tight text-[#17261D]">
            {producto.nombre}
          </h3>
          {vendedor && (
            <p className="text-xs text-[#4F6355]">Vendido por {vendedor}</p>
          )}
        </div>
      </Link>

      {/* Controles: fuera del Link para no navegar al tocarlos */}
      <div className="mt-auto flex flex-col gap-3 p-4 pt-3">
        {/* Selector de unidad (visual por ahora) */}
        <div className="flex flex-wrap gap-1.5">
          {UNIDADES.map((u) => (
            <button
              key={u.nombre}
              type="button"
              aria-pressed={unidad === u.nombre}
              onClick={() => setUnidad(u.nombre)}
              className={`min-h-8 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                unidad === u.nombre
                  ? "border-[#14432F] bg-[#14432F] text-white"
                  : "border-[#C9D6C0] bg-white text-[#17261D] hover:bg-[#EAF0E2]"
              }`}
            >
              {u.nombre}
            </button>
          ))}
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <span className="text-2xl font-extrabold text-[#17261D]">
            ${producto.precio.toLocaleString("es-CO")}
            <span className="ml-1 text-xs font-medium text-[#4F6355]">
              / {sufijoUnidad}
            </span>
          </span>

          <span
            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${stockBadge}`}
          >
            {stockTexto}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAgregar}
          disabled={agotado}
          className={`min-h-11 w-full rounded-xl py-3 text-sm font-bold transition-colors ${
            agotado
              ? "cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400"
              : "bg-[#14432F] text-white hover:bg-[#0E3323] active:scale-[0.98]"
          }`}
        >
          {agotado ? "No disponible" : "Añadir al carrito"}
        </button>
      </div>
    </article>
  );
};

export default memo(Producto);