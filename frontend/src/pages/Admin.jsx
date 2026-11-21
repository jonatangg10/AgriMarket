import { useContext, useMemo, useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { ProductContext } from "../context/ProductContext";
import ProductForm from "../components/ProductForm";
import { useAuth } from "../context/AuthContext";
import ProductorLayout from "../components/ProductorLayout";
import SortableHeader from "../components/SortableHeader";

import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

const AdminProductos = () => {
  const {
    obtenerProductosPaginados,
    eliminarProducto,
    guardarProducto,
    loadingProducts: loading,
    categorias,
  } = useContext(ProductContext);

  const { usuario } = useAuth();

  const [vista, setVista] = useState("tabla");

  const [globalFilter, setGlobalFilter] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("");

  const filtrosIniciales = { estado_id: "", stock: "", precio_min: "", precio_max: "" };
  const [filtros, setFiltros] = useState(filtrosIniciales);

  const cambiarFiltro = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const hayFiltros =
    globalFilter !== "" ||
    categoriaFilter !== "" ||
    Object.values(filtros).some((v) => v !== "");

  const limpiarFiltros = () => {
    setGlobalFilter("");
    setCategoriaFilter("");
    setFiltros(filtrosIniciales);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const [productoEditando, setProductoEditando] = useState(null);
  const [productosPaginados, setProductosPaginados] = useState([]);
  const [totalProductos, setTotalProductos] = useState(0);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState([]);

  // Al cambiar el orden volvemos a la primera página
  const handleSortingChange = (updater) => {
    setSorting(updater);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // esto porque teniamos las imagenes en front y ahora las nuevas se guardan en el node
  const obtenerUrlImagen = (ruta) => {
    if (!ruta) return "/images/placeholder.jpg";
    // si la imagen viene del backend (multer)
    if (ruta.startsWith('/uploads/')) {
      return `https://agrimarket-yfbo.onrender.com${ruta}`;
    }
    // Si la imagen viene del frontend (las que ya estaban)
    return ruta;
  };

  const cargarProductos = async () => {
    const { productos: productosData, total } = await obtenerProductosPaginados({
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      search: globalFilter,
      categoria: categoriaFilter,
      usuario_id: usuario?.rol === 1 ? "" : (usuario?.id || ""),
      ...filtros,
      sort_by: sorting[0]?.id || "",
      sort_dir: sorting[0] ? (sorting[0].desc ? "desc" : "asc") : "",
    });

    setProductosPaginados(productosData || []);
    setTotalProductos(total || 0);
  };

  useEffect(() => {
    if (vista === "tabla") {
      cargarProductos();
    }
  }, [pagination, globalFilter, categoriaFilter, filtros, sorting, vista]);

  const handleCrearNuevo = () => {
    setProductoEditando(null);
    setVista("formulario");
  };

  const handleEditar = (producto) => {
    setProductoEditando(producto);
    setVista("formulario");
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      const exito = await eliminarProducto(id);
      if (exito) cargarProductos();
    }
  };

  const handleGuardarProducto = async (datosProducto) => {
    const exito = await guardarProducto(datosProducto);
    if (exito) {
      setVista("tabla");
      cargarProductos();
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "nombre",
        header: "Producto",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <img
              src={obtenerUrlImagen(row.original.imagen)}
              alt={row.original.nombre}
              className="h-11 w-11 object-cover rounded-xl border border-slate-200"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800">
                {row.original.nombre}
              </span>
              <span className="text-xs text-slate-400">
                {row.original.etiqueta}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "precio",
        header: "Precio",
        cell: (info) => (
          <span className="font-bold text-slate-700">
            ${Number(info.getValue()).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: (info) => (
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider
              ${info.getValue() < 5
                ? "bg-rose-50 text-rose-600 border border-rose-200"
                : "bg-emerald-50 text-emerald-600 border border-emerald-200"
              }`}
          >
            {info.getValue()} unid.
          </span>
        ),
      },
      {
        accessorKey: "categoria",
        header: "Categoría",
        cell: ({ getValue }) => (
          <span className="text-slate-600 font-semibold">
            {getValue()}
          </span>
        ),
      },
      {
        accessorKey: "estado_id",
        header: "Estado",
        cell: ({ row }) => {
          const activo = Number(row.original.estado_id) === 1;
          return (
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${activo
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : "bg-slate-100 text-slate-500 border border-slate-200"
                }`}
            >
              {activo ? "Activo" : "Inactivo"}
            </span>
          );
        },
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleEditar(row.original)}
              className="text-[#14432F] hover:text-blue-800 transition-colors"
              title="Editar"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleEliminar(row.original.id)}
              className="text-red-600 hover:text-red-800 transition-colors"
              title="Eliminar BD"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: productosPaginados,
    columns,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    enableMultiSort: false,
    sortDescFirst: false,
    pageCount: Math.ceil(totalProductos / pagination.pageSize),
  });
  
  const Layout = usuario?.rol === 3 ? ProductorLayout : AdminLayout;

  return (
    <Layout activeTab="productos">
      <div className="space-y-8">
        {vista === "formulario" ? (
          <ProductForm
            producto={productoEditando}
            onSave={handleGuardarProducto}
            onCancel={() => setVista("tabla")}
          />
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <CubeIcon className="h-8 w-8 text-[#14432F]" />
                  Gestión de Productos
                </h1>
                <p className="text-slate-500 mt-2 font-medium">
                  Agrega, edita o elimina productos directamente de la base de datos.
                </p>
              </div>

              <button
                onClick={handleCrearNuevo}
                className="flex items-center gap-2 px-5 py-3 bg-[#14432F] hover:bg-blue-500 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20"
              >
                <PlusIcon className="h-5 w-5" />
                Nuevo Producto
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:flex-wrap lg:items-end gap-4">
                <div className="flex flex-col gap-1 w-full lg:w-72">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Buscar
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre del producto..."
                    value={globalFilter}
                    onChange={(e) => {
                      setGlobalFilter(e.target.value);
                      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1 w-full lg:w-48">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Categoría
                  </label>
                  <select
                    value={categoriaFilter}
                    onChange={(e) => {
                      setCategoriaFilter(e.target.value);
                      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                  >
                    <option value="">Todas</option>
                    {categorias?.map((cat, i) => (
                      <option key={i} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1 w-full lg:w-40">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Estado
                  </label>
                  <select
                    value={filtros.estado_id}
                    onChange={(e) => cambiarFiltro("estado_id", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                  >
                    <option value="">Todos</option>
                    <option value="1">Activo</option>
                    <option value="2">Inactivo</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1 w-full lg:w-44">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Stock
                  </label>
                  <select
                    value={filtros.stock}
                    onChange={(e) => cambiarFiltro("stock", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                  >
                    <option value="">Todo</option>
                    <option value="disponible">Disponible (5+)</option>
                    <option value="bajo">Bajo (1-4)</option>
                    <option value="agotado">Agotado (0)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1 w-full lg:w-auto">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Precio
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="Mín"
                      value={filtros.precio_min}
                      onChange={(e) => cambiarFiltro("precio_min", e.target.value)}
                      className="w-full lg:w-28 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="Máx"
                      value={filtros.precio_max}
                      onChange={(e) => cambiarFiltro("precio_max", e.target.value)}
                      className="w-full lg:w-28 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                    />
                  </div>
                </div>

                {hayFiltros && (
                  <button
                    onClick={limpiarFiltros}
                    className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                {loading ? (
                  <div className="py-16 text-center text-slate-500 font-medium flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                  </div>
                ) : productosPaginados.length === 0 ? (
                  <div className="py-16 text-center text-slate-500 font-medium">
                    No se encontraron productos en la BD.
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr
                          key={headerGroup.id}
                          className="bg-slate-50 border-b border-slate-100"
                        >
                          {headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-400"
                            >
                              <SortableHeader header={header} />
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {table.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className="px-6 py-4 text-sm text-slate-700 font-medium"
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
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
                  Mostrando {productosPaginados.length} de {totalProductos} productos
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 disabled:opacity-50 transition-all"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 disabled:opacity-50 transition-all"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminProductos;