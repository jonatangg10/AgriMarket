import { useMemo, useState, useEffect } from "react";
import ProductorLayout from "../components/ProductorLayout";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext"; 
import {
  InboxArrowDownIcon,
} from "@heroicons/react/24/outline";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

const ESTADOS_VENTA = [
  { id: 1, label: 'Pendiente', color: 'bg-amber-100 text-amber-700' },
  { id: 2, label: 'Confirmada', color: 'bg-blue-100 text-blue-700' },
  { id: 3, label: 'En preparación', color: 'bg-purple-100 text-purple-700' },
  { id: 4, label: 'Enviada', color: 'bg-indigo-100 text-indigo-700' },
  { id: 5, label: 'Entregada', color: 'bg-emerald-100 text-emerald-700' },
  { id: 6, label: 'Rechazada', color: 'bg-red-100 text-red-700' },
  { id: 7, label: 'Cancelada', color: 'bg-slate-200 text-slate-700' }
];

const ProductorSolicitudes = () => {
  const { usuario } = useAuth(); 
  
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const cargarSolicitudes = async () => {
    // Verificamos que el usuario y su ID existan antes de hacer el fetch
    if (!usuario || !usuario.id) {
      setLoading(false);
      return; 
    }

    setLoading(true);
    try {
      const res = await fetch(`https://agrimarket-yfbo.onrender.com/api/ventas/productor/${usuario.id}`);
      
      if (!res.ok) throw new Error("Error al obtener solicitudes");
      
      const ventas = await res.json();

      const solicitudesPlanas = [];
      ventas.forEach(venta => {
        if (venta.detalles_productor) {
          venta.detalles_productor.forEach(detalle => {
            solicitudesPlanas.push({
              ...detalle, 
              venta_id: venta.id,
              cliente_nombre: venta.cliente_nombre,
              cliente_telefono: venta.cliente_telefono,
              fecha_creacion: venta.fecha_creacion,
            });
          });
        }
      });

      setSolicitudes(solicitudesPlanas);
    } catch (error) {
      console.error("Error al cargar solicitudes:", error);
      toast.error("No se pudieron cargar las solicitudes");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    cargarSolicitudes();
  }, [usuario]);

  const handleCambiarEstado = async (detalle_id, nuevo_estado_id) => {
    try {
      const res = await fetch(`https://agrimarket-yfbo.onrender.com/api/ventas/detalle/${detalle_id}/estado`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado_venta_id: nuevo_estado_id })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Estado actualizado");
        cargarSolicitudes();
      } else {
        toast.error(data.error || "Error al actualizar");
      }
    } catch (error) {
      console.error("Error en petición PUT:", error);
      toast.error("Error de conexión");
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "venta_id",
        header: "N° Pedido",
        cell: (info) => <span className="font-bold text-slate-600">#{info.getValue()}</span>,
      },
      {
        accessorKey: "cliente_nombre",
        header: "Cliente",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800">{row.original.cliente_nombre}</span>
            <span className="text-xs text-slate-500">Tel: {row.original.cliente_telefono}</span>
          </div>
        ),
      },
      {
        accessorKey: "producto",
        header: "Producto",
        cell: ({ row }) => (
          <span className="font-semibold text-[#14432F]">{row.original.producto}</span>
        ),
      },
      {
        accessorKey: "cantidad",
        header: "Cant.",
        cell: (info) => <span className="text-slate-600">{info.getValue()} unid.</span>,
      },
      {
        accessorKey: "subtotal",
        header: "Ingreso",
        cell: (info) => (
          <span className="font-bold text-emerald-600">
            ${Number(info.getValue()).toLocaleString()}
          </span>
        ),
      },
      {
        id: "estado",
        header: "Estado de Entrega",
        cell: ({ row }) => {
          const estadoActual = row.original.estado_venta_id || 1;
          const configEstado = ESTADOS_VENTA.find(e => e.id === estadoActual) || ESTADOS_VENTA[0];

          return (
            <select
              value={estadoActual}
              onChange={(e) => handleCambiarEstado(row.original.detalle_id, Number(e.target.value))}
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider outline-none cursor-pointer border-r-8 border-transparent transition-all ${configEstado.color}`}
            >
              {ESTADOS_VENTA.map(est => (
                <option key={est.id} value={est.id} className="bg-white text-slate-800">
                  {est.label}
                </option>
              ))}
            </select>
          );
        },
      },
    ],
    []
  );

  const datosFiltrados = useMemo(() => {
    if (!globalFilter) return solicitudes;
    return solicitudes.filter(s => 
      s.producto.toLowerCase().includes(globalFilter.toLowerCase()) ||
      s.cliente_nombre.toLowerCase().includes(globalFilter.toLowerCase())
    );
  }, [solicitudes, globalFilter]);

  const table = useReactTable({
    data: datosFiltrados,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    pageCount: Math.ceil(datosFiltrados.length / pagination.pageSize),
  });

  return (
    <ProductorLayout activeTab="solicitudes">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <InboxArrowDownIcon className="h-8 w-8 text-[#14432F]" />
              Solicitudes Recibidas
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Gestiona el estado de entrega de los productos que te han comprado.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row gap-4">
            <input
              type="text"
              placeholder="Buscar por cliente o producto..."
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
              className="w-full lg:w-96 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
            />
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-16 text-center text-slate-500 font-medium flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : datosFiltrados.length === 0 ? (
              <div className="py-16 text-center text-slate-500 font-medium">
                No tienes solicitudes que coincidan con la búsqueda.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="bg-slate-50 border-b border-slate-100">
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {table.getRowModel().rows.slice(
                    pagination.pageIndex * pagination.pageSize,
                    (pagination.pageIndex + 1) * pagination.pageSize
                  ).map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4 text-sm text-slate-700 font-medium">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 border-t border-slate-100">
            <div className="text-sm text-slate-500 font-medium">
              Mostrando página {pagination.pageIndex + 1} de {table.getPageCount() || 1}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage() || pagination.pageIndex === 0}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 disabled:opacity-50 transition-all"
              >
                Anterior
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={pagination.pageIndex >= table.getPageCount() - 1}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 disabled:opacity-50 transition-all"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProductorLayout>
  );
};

export default ProductorSolicitudes;