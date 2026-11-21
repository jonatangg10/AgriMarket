import { useMemo, useState } from "react";
import { Squares2X2Icon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

// Cuántas categorías se muestran antes de "Ver todas"
const PRINCIPALES = 5;

const obtenerUrlImagen = (ruta) => {
  if (!ruta) return null;
  if (ruta.startsWith("/uploads/")) return `https://agrimarket-yfbo.onrender.com${ruta}`;
  return ruta;
};

const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

/**
 * "Explora por categoría": tarjetas con foto de un producto real de cada categoría.
 * Muestra las categorías con más productos y el resto detrás de "Ver todas".
 */
const CategoriasDestacadas = ({ productos, seleccionada, onSeleccionar }) => {
  const [expandido, setExpandido] = useState(false);

  const { categorias, total } = useMemo(() => {
    const activos = productos.filter((p) => Number(p.estado_id) === 1);
    const mapa = {};
    activos.forEach((p) => {
      const nombre = p.categoria || "general";
      if (!mapa[nombre]) mapa[nombre] = { nombre, cantidad: 0, imagen: null, stockImagen: -1 };
      mapa[nombre].cantidad += 1;
      // Foto de la categoría: el producto con imagen y más stock (suele ser el más representativo)
      if (p.imagen && p.stock > mapa[nombre].stockImagen) {
        mapa[nombre].imagen = obtenerUrlImagen(p.imagen);
        mapa[nombre].stockImagen = p.stock;
      }
    });
    const lista = Object.values(mapa).sort(
      (a, b) => b.cantidad - a.cantidad || a.nombre.localeCompare(b.nombre)
    );
    return { categorias: lista, total: activos.length };
  }, [productos]);

  const hayMas = categorias.length > PRINCIPALES;

  let visibles = expandido ? categorias : categorias.slice(0, PRINCIPALES);
  // Si la categoría elegida quedó oculta, se muestra igual (en lugar de la última)
  if (!expandido && seleccionada !== "todos" && !visibles.some((c) => c.nombre === seleccionada)) {
    const elegida = categorias.find((c) => c.nombre === seleccionada);
    if (elegida) visibles = [...visibles.slice(0, PRINCIPALES - 1), elegida];
  }

  const anillo = (activa) =>
    activa ? "ring-4 ring-[#14432F] ring-offset-2 ring-offset-[#F5F7F1]" : "ring-1 ring-black/5";

  return (
    <section id="categorias" className="mx-auto max-w-6xl scroll-mt-[116px] px-4 pt-14">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#17261D] sm:text-3xl">
            Explora por categoría
          </h2>
          <p className="mt-1 text-sm text-[#4F6355]">
            {categorias.length} categorías · {total} productos frescos
          </p>
        </div>

        {hayMas && (
          <button
            type="button"
            onClick={() => setExpandido((v) => !v)}
            aria-expanded={expandido}
            className="flex min-h-11 items-center gap-1.5 rounded-xl border border-[#C9D6C0] bg-white px-4 text-sm font-bold text-[#14432F] transition-colors hover:bg-[#EAF0E2]"
          >
            {expandido ? "Ver menos" : `Ver todas (${categorias.length})`}
            {expandido ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        {/* Todos */}
        <button
          type="button"
          onClick={() => onSeleccionar("todos")}
          aria-pressed={seleccionada === "todos"}
          className={`group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl bg-[#14432F] p-4 text-left transition-shadow hover:shadow-lg sm:aspect-square ${anillo(
            seleccionada === "todos"
          )}`}
        >
          <Squares2X2Icon className="absolute right-4 top-4 h-8 w-8 text-[#9BD17A] transition-transform duration-300 group-hover:scale-110" />
          <span className="text-lg font-extrabold leading-tight text-white">Todos</span>
          <span className="text-xs font-medium text-white/75">{total} productos</span>
        </button>

        {visibles.map((cat) => {
          const activa = seleccionada === cat.nombre;
          return (
            <button
              key={cat.nombre}
              type="button"
              onClick={() => onSeleccionar(cat.nombre)}
              aria-pressed={activa}
              className={`group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl bg-[#DCE6D3] p-4 text-left transition-shadow hover:shadow-lg sm:aspect-square ${anillo(
                activa
              )}`}
            >
              {cat.imagen ? (
                <img
                  src={cat.imagen}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-5xl font-extrabold text-[#14432F]/30">
                  {cat.nombre.charAt(0).toUpperCase()}
                </span>
              )}
              {/* Degradado para que el texto se lea sobre cualquier foto */}
              <span className="absolute inset-0 bg-gradient-to-t from-[#0E2A1D]/90 via-[#0E2A1D]/25 to-transparent" />

              <span className="relative text-lg font-extrabold leading-tight text-white">
                {capitalizar(cat.nombre)}
              </span>
              <span className="relative text-xs font-medium text-white/80">
                {cat.cantidad} {cat.cantidad === 1 ? "producto" : "productos"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoriasDestacadas;
