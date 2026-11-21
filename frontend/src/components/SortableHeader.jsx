import { flexRender } from "@tanstack/react-table";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";

/**
 * Encabezado de columna con flechas de ordenamiento.
 * Clic: ascendente → descendente → sin orden.
 */
const SortableHeader = ({ header }) => {
  const titulo = flexRender(header.column.columnDef.header, header.getContext());

  if (!header.column.getCanSort()) return titulo;

  const orden = header.column.getIsSorted(); // "asc" | "desc" | false

  return (
    <button
      type="button"
      onClick={header.column.getToggleSortingHandler()}
      className={`flex items-center gap-1 uppercase tracking-wider select-none transition-colors hover:text-slate-700 ${
        orden ? "text-slate-700" : ""
      }`}
      title="Ordenar"
    >
      {titulo}
      {orden === "asc" ? (
        <ChevronUpIcon className="h-4 w-4 text-[#14432F]" />
      ) : orden === "desc" ? (
        <ChevronDownIcon className="h-4 w-4 text-[#14432F]" />
      ) : (
        <ChevronUpDownIcon className="h-4 w-4 opacity-50" />
      )}
    </button>
  );
};

export default SortableHeader;
