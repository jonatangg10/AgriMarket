import { useState } from "react";

// ---------- Formato ----------
export const formatoCOP = (v) => `$${Math.round(Number(v) || 0).toLocaleString("es-CO")}`;

export const formatoCOPCompacto = (v) => {
  const n = Number(v) || 0;
  if (Math.abs(n) < 10000) return formatoCOP(n);
  return `$${new Intl.NumberFormat("es-CO", { notation: "compact", maximumFractionDigits: 1 }).format(n)}`;
};

// Máximo "redondo" para el eje (1, 1.5, 2, 3, 4, 5, 6, 8 × 10^n): mitades limpias y poco aire sobrante
const techoRedondo = (max) => {
  if (max <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(max)));
  const paso = [1, 1.5, 2, 3, 4, 5, 6, 8, 10].find((m) => m * exp >= max);
  return paso * exp;
};

// ---------- Contenedor de cada gráfica ----------
export const Tarjeta = ({ titulo, subtitulo, children, acciones, className = "" }) => (
  <section className={`flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-lg font-bold text-slate-900">{titulo}</h3>
        {subtitulo && <p className="mt-0.5 text-sm text-slate-500">{subtitulo}</p>}
      </div>
      {acciones && <div className="shrink-0 whitespace-nowrap pt-1">{acciones}</div>}
    </div>
    {children}
  </section>
);

// Tabla accesible con los mismos datos de la gráfica
export const VerDatos = ({ columnas, filas }) => (
  <details className="mt-4 text-sm">
    <summary className="cursor-pointer select-none font-bold text-[#14432F] hover:underline">Ver datos</summary>
    <div className="mt-3 max-h-64 overflow-auto rounded-xl border border-slate-100">
      <table className="w-full text-left">
        <thead className="sticky top-0 bg-slate-50">
          <tr>
            {columnas.map((c, i) => (
              <th key={c} className={`px-4 py-2 text-[11px] font-extrabold uppercase text-slate-400 ${i > 0 ? "text-right" : ""}`}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filas.map((f, i) => (
            <tr key={i}>
              {f.map((celda, j) => (
                <td key={j} className={`px-4 py-2 text-slate-700 ${j > 0 ? "text-right tabular-nums" : ""}`}>
                  {celda}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </details>
);

// ---------- Indicador (stat tile) ----------
export const Indicador = ({ etiqueta, valor, detalle, icono: Icono }) => (
  <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
    <div className="mb-4 flex items-start justify-between">
      <p className="text-sm font-bold text-slate-500">{etiqueta}</p>
      {Icono && (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-2.5 text-[#14432F]">
          <Icono className="h-5 w-5" />
        </div>
      )}
    </div>
    <p className="text-3xl font-black text-slate-900">{valor}</p>
    {detalle && <p className="mt-1 text-sm text-slate-500">{detalle}</p>}
  </div>
);

// ---------- Columnas: una serie en el tiempo ----------
/**
 * datos: [{ clave, etiqueta, etiquetaLarga, valor, extra }]
 * Columnas de máx. 24px, punta redondeada 4px, base recta, tooltip al pasar el mouse.
 */
export const GraficaColumnas = ({ datos, formatoValor = (v) => v, formatoEje = formatoValor, describirExtra }) => {
  const [activo, setActivo] = useState(null);
  const ALTO = 220;
  const max = techoRedondo(Math.max(0, ...datos.map((d) => d.valor)));
  const ticks = [0, max / 2, max];
  // En celular se muestra solo una de cada dos etiquetas del eje X
  const saltar = datos.length > 8;

  return (
    <div className="relative">
      <div className="flex gap-3">
        {/* Eje Y */}
        <div className="relative w-14 shrink-0 text-right" style={{ height: ALTO }}>
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute right-0 -translate-y-1/2 text-[11px] tabular-nums text-slate-400"
              style={{ top: ALTO - (t / max) * ALTO }}
            >
              {formatoEje(t)}
            </span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          {/* Líneas guía */}
          <div className="pointer-events-none absolute inset-x-0 top-0" style={{ height: ALTO }}>
            {ticks.map((t) => (
              <div
                key={t}
                className={`absolute inset-x-0 h-px ${t === 0 ? "bg-slate-300" : "bg-slate-100"}`}
                style={{ top: ALTO - (t / max) * ALTO }}
              />
            ))}
          </div>

          {/* Columnas */}
          <div className="relative flex" style={{ height: ALTO }} onMouseLeave={() => setActivo(null)}>
            {datos.map((d, i) => {
              const alto = max > 0 ? (d.valor / max) * ALTO : 0;
              const esActivo = activo === i;
              return (
                <button
                  key={d.clave}
                  type="button"
                  className="group relative flex h-full flex-1 items-end justify-center outline-none"
                  onMouseEnter={() => setActivo(i)}
                  onFocus={() => setActivo(i)}
                  onBlur={() => setActivo(null)}
                  aria-label={`${d.etiquetaLarga}: ${formatoValor(d.valor)}${describirExtra ? `, ${describirExtra(d)}` : ""}`}
                >
                  {esActivo && <span className="absolute inset-0 rounded-lg bg-slate-100/70" />}
                  <span
                    className={`relative w-[60%] max-w-6 rounded-t transition-colors ${
                      esActivo ? "bg-[#0E3323]" : "bg-[#14432F]"
                    } group-focus-visible:ring-2 group-focus-visible:ring-[#9BD17A]`}
                    style={{ height: d.valor > 0 ? Math.max(alto, 3) : 0 }}
                  />
                </button>
              );
            })}
          </div>

          {/* Eje X */}
          <div className="mt-2 flex">
            {datos.map((d, i) => (
              <span
                key={d.clave}
                className={`flex-1 text-center text-[11px] text-slate-400 ${saltar && i % 2 === 1 ? "hidden sm:block" : ""}`}
              >
                {d.etiqueta}
              </span>
            ))}
          </div>

          {/* Tooltip */}
          {activo !== null && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-xl bg-slate-900 px-3 py-2 text-xs text-white shadow-lg"
              style={{
                left: `${((activo + 0.5) / datos.length) * 100}%`,
                top: Math.max(0, ALTO - (datos[activo].valor / max) * ALTO - 64),
              }}
            >
              <p className="font-bold">{datos[activo].etiquetaLarga}</p>
              <p className="tabular-nums">{formatoValor(datos[activo].valor)}</p>
              {describirExtra && <p className="text-slate-300">{describirExtra(datos[activo])}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------- Barra segmentada (partes de un total) ----------
/**
 * partes: [{ id, nombre, valor, color, textoClaro (bool), icono }]
 * Barra alta de 28px, cada parte con su % dentro si cabe, leyenda debajo con nombre y cantidad.
 */
export const BarraSegmentada = ({ partes, unidad = "" }) => {
  const [activo, setActivo] = useState(null);
  const total = partes.reduce((s, p) => s + p.valor, 0);
  const visibles = partes.filter((p) => p.valor > 0);

  if (total === 0) {
    return <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">Aún no hay datos.</p>;
  }

  const pct = (v) => Math.round((v / total) * 100);

  return (
    <div>
      <div
        className="flex h-7 w-full gap-0.5"
        role="img"
        aria-label={visibles.map((p) => `${p.nombre}: ${p.valor} (${pct(p.valor)}%)`).join(", ")}
        onMouseLeave={() => setActivo(null)}
      >
        {visibles.map((p) => (
          <div
            key={p.id}
            onMouseEnter={() => setActivo(p.id)}
            className={`flex min-w-0 items-center rounded px-2 text-xs font-bold transition-opacity ${
              activo && activo !== p.id ? "opacity-60" : ""
            }`}
            style={{
              width: `${(p.valor / total) * 100}%`,
              backgroundColor: p.color,
              color: p.textoClaro ? "#ffffff" : "#0b0b0b",
            }}
            title={`${p.nombre}: ${p.valor}${unidad} (${pct(p.valor)}%)`}
          >
            {/* El % solo se imprime si la parte es suficientemente ancha */}
            {p.valor / total >= 0.12 && <span className="truncate">{pct(p.valor)}%</span>}
          </div>
        ))}
      </div>

      <ul className="mt-4 space-y-2">
        {partes.map((p) => (
          <li
            key={p.id}
            onMouseEnter={() => setActivo(p.id)}
            onMouseLeave={() => setActivo(null)}
            className={`flex items-center gap-3 rounded-xl px-2 py-1.5 text-sm transition-colors ${
              activo === p.id ? "bg-slate-50" : ""
            }`}
          >
            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: p.color }} />
            {p.icono && <p.icono className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />}
            <span className="flex-1 font-medium text-slate-700">{p.nombre}</span>
            <span className="tabular-nums font-bold text-slate-900">
              {p.valor}
              {unidad}
            </span>
            <span className="w-10 text-right tabular-nums text-slate-400">{pct(p.valor)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ---------- Barras horizontales ordenadas ----------
export const BarrasHorizontales = ({ datos, formatoValor = (v) => v }) => {
  const max = Math.max(1, ...datos.map((d) => d.valor));

  if (datos.length === 0) {
    return <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">Aún no hay datos.</p>;
  }

  return (
    <ul className="space-y-3">
      {datos.map((d) => (
        <li key={d.nombre} className="group" title={`${d.nombre}: ${formatoValor(d.valor)}`}>
          <div className="mb-1 flex justify-between gap-3 text-sm">
            <span className="truncate font-medium text-slate-700">{d.nombre}</span>
            <span className="tabular-nums font-bold text-slate-900">{formatoValor(d.valor)}</span>
          </div>
          <div className="h-2.5 w-full rounded-r bg-slate-100">
            <div
              className="h-full rounded-r bg-[#14432F] transition-colors group-hover:bg-[#0E3323]"
              style={{ width: `${(d.valor / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};
