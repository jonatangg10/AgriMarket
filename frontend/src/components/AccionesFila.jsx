import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

/** Botones "Editar" y "Eliminar" de cada fila de las tablas del panel. */
const AccionesFila = ({ onEditar, onEliminar, nombre = "" }) => (
  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={onEditar}
      aria-label={`Editar ${nombre}`.trim()}
      className="inline-flex items-center gap-1.5 rounded-xl border border-[#14432F]/20 bg-emerald-50 px-3 py-2 text-xs font-bold text-[#14432F] transition-all hover:border-[#14432F] hover:bg-[#14432F] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14432F]/40"
    >
      <PencilIcon className="h-4 w-4" />
      Editar
    </button>

    <button
      type="button"
      onClick={onEliminar}
      aria-label={`Eliminar ${nombre}`.trim()}
      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition-all hover:border-red-600 hover:bg-red-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
    >
      <TrashIcon className="h-4 w-4" />
      Eliminar
    </button>
  </div>
);

export default AccionesFila;
