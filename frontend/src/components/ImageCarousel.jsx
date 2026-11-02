import { useState, useEffect, useMemo } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

// Datos fijos por ahora (luego pueden venir de la BD)
const slides = [
  {
    img: "/fondos/Mango-Tolima.png",
    alt: "Mango azúcar",
    producto: "Mango azúcar",
    detalle: "Cosechado hace 6 horas · Tobia",
  },
  {
    img: "/fondos/Cafe-Huila.png",
    alt: "Café especial",
    producto: "Café especial",
    detalle: "Cosechado hace 1 día · Huila",
  },
  {
    img: "/fondos/Papa-Boyaca.png",
    alt: "Papa criolla",
    producto: "Papa criolla",
    detalle: "Cosechado hace 12 horas · Boyacá",
  },
  {
    img: "/fondos/Aguacate-Antioquia.png",
    alt: "Aguacate Hass",
    producto: "Aguacate Hass",
    detalle: "Cosechado hace 8 horas · Antioquia",
  },
];

function ImageCarousel({
  busqueda = "",
  onBusquedaChange = () => {},
  municipios = [], // solo municipios que tienen productos
  municipiosSel = [],
  onMunicipioChange = () => {},
  onBuscar = () => {},
}) {
  const [actual, setActual] = useState(0);

  // Rotación automática cada 5 s
  useEffect(() => {
    const id = setInterval(() => {
      setActual((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Lista ordenada y sin repetidos. Si hay uno marcado que no está en la lista, también se incluye
  const listaMunicipios = useMemo(() => {
    const unicos = new Set(municipios.filter(Boolean));
    if (municipiosSel.length === 1) unicos.add(municipiosSel[0]);
    return [...unicos].sort((a, b) => a.localeCompare(b));
  }, [municipios, municipiosSel]);

  // "" = todos, un municipio = ese, "__varios" = hay varios marcados en el panel lateral
  const valorSelect =
    municipiosSel.length === 0
      ? ""
      : municipiosSel.length === 1
      ? municipiosSel[0]
      : "__varios";

  const handleMunicipio = (e) => {
    const valor = e.target.value;
    if (valor === "__varios") return;
    onMunicipioChange(valor); // filtra de inmediato
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onBuscar(); // App baja hasta la lista de productos
  };

  const slide = slides[actual];

  return (
    <section id="inicio" className="w-full scroll-mt-[100px] bg-[#EAF0E2] pt-[100px]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-10 lg:grid-cols-2 lg:py-14">
        {/* Columna izquierda: texto + buscador */}
        <div>
          <span className="inline-block rounded-full bg-[#F6D77A] px-3 py-1 text-[11px] font-bold text-[#4A3500]">
            Directo del productor
          </span>

          <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight text-[#17261D] sm:text-5xl">
            Del campo a tu mesa, sin intermediarios.
          </h1>

          <p className="mt-4 max-w-md text-base leading-relaxed text-[#4F6355] sm:text-lg">
            Compra frutas, hortalizas y granos cosechados por familias
            campesinas de Cundinamarca. Sabes quién lo cultivó y cuándo.
          </p>

          <form
            onSubmit={handleSubmit}
            role="search"
            className="mt-6 flex flex-wrap gap-2 rounded-2xl border border-[#C9D6C0] bg-white p-2"
          >
            <label htmlFor="hero-busqueda" className="sr-only">
              Buscar producto
            </label>
            <input
              id="hero-busqueda"
              type="text"
              value={busqueda}
              onChange={(e) => onBusquedaChange(e.target.value)}
              placeholder="Busca mango, papa criolla, café..."
              className="min-h-11 min-w-[160px] flex-1 border-0 bg-transparent px-3 text-sm outline-none placeholder:text-gray-400"
            />

            {/* Desplegable de municipios con productos */}
            <div className="relative w-full sm:w-56">
              <label htmlFor="hero-municipio" className="sr-only">
                Municipio
              </label>
              <select
                id="hero-municipio"
                value={valorSelect}
                onChange={handleMunicipio}
                className="min-h-11 w-full cursor-pointer appearance-none rounded-xl border border-[#C9D6C0] bg-white py-2 pl-3 pr-10 text-sm font-medium text-[#17261D] outline-none focus:border-[#14432F] focus:ring-2 focus:ring-[#CFE7D6]"
              >
                <option value="">Todos los municipios</option>
                {municipiosSel.length > 1 && (
                  <option value="__varios" disabled>
                    {municipiosSel.length} municipios
                  </option>
                )}
                {listaMunicipios.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4F6355]"
                aria-hidden="true"
              />
            </div>

            <button
              type="submit"
              className="min-h-11 rounded-xl bg-[#14432F] px-5 text-sm font-bold text-white transition-colors hover:bg-[#0E3323]"
            >
              Buscar
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-bold text-[#17261D]">
            <span>+120 productores</span>
            <span>Cosecha de hoy</span>
            <span>Pago seguro</span>
          </div>
        </div>

        {/* Columna derecha: foto rotativa + tarjeta flotante */}
        <div className="relative">
          <div className="relative h-[280px] overflow-hidden rounded-3xl bg-[#DCE6D3] sm:h-[360px] lg:h-[420px]">
            {slides.map((s, i) => (
              <img
                key={s.img}
                src={s.img}
                alt={s.alt}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                  i === actual ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}

            {/* Indicadores */}
            <div className="absolute bottom-4 right-4 flex gap-1.5">
              {slides.map((s, i) => (
                <button
                  key={s.img}
                  type="button"
                  onClick={() => setActual(i)}
                  aria-label={`Ver ${s.producto}`}
                  className={`h-2.5 rounded-full transition-all ${
                    i === actual ? "w-6 bg-white" : "w-2.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Tarjeta flotante */}
          <div className="absolute bottom-6 left-4 flex items-center gap-3 rounded-2xl border border-[#E1E8DA] bg-white px-4 py-3 shadow-lg lg:-left-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F6D77A] text-xs font-bold text-[#4A3500]">
              Hoy
            </div>
            <div>
              <p className="text-sm font-bold text-[#17261D]">{slide.producto}</p>
              <p className="text-xs text-[#4F6355]">{slide.detalle}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ImageCarousel;