import { useContext, useMemo, useState, useEffect } from "react";

import AdminLayout from "../components/AdminLayout";
import { toast ,Toaster} from 'react-hot-toast';
import { UserContext } from "../context/UserContext";
import UserForm from "../components/UserForm";
import SortableHeader from "../components/SortableHeader";
import AccionesFila from "../components/AccionesFila";

import {
  PlusIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

const AdminUsers = () => {
  const {
    obtenerUsuariosPaginados,
    eliminarUsuario,
    loadingUsers,
    guardarUsuario,
  } = useContext(UserContext);

  const [vista, setVista] = useState("tabla");

  const [globalFilter, setGlobalFilter] = useState("");

  const filtrosIniciales = { rol_id: "", fecha_desde: "", fecha_hasta: "" };
  const [filtros, setFiltros] = useState(filtrosIniciales);

  const cambiarFiltro = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const hayFiltros =
    globalFilter !== "" || Object.values(filtros).some((v) => v !== "");

  const limpiarFiltros = () => {
    setGlobalFilter("");
    setFiltros(filtrosIniciales);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const [usuarioEditando, setUsuarioEditando] = useState(null);

  const [usuariosPaginados, setUsuariosPaginados] = useState([]);

  const [totalUsuarios, setTotalUsuarios] = useState(0);

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

  const cargarUsuarios = async () => {
    const { usuarios, total } = await obtenerUsuariosPaginados({
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      search: globalFilter,
      ...filtros,
      sort_by: sorting[0]?.id || "",
      sort_dir: sorting[0] ? (sorting[0].desc ? "desc" : "asc") : "",
    });

    setUsuariosPaginados(usuarios);
    setTotalUsuarios(total);
  };

  useEffect(() => {
    if (vista === "tabla") {
      cargarUsuarios();
    }
  }, [pagination, globalFilter, filtros, sorting, vista]);

  const handleCrearNuevo = () => {
    setUsuarioEditando(null);
    setVista("formulario");
  };

  const handleEditar = (usuario) => {
    setUsuarioEditando(usuario);
    setVista("formulario");
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      const exito = await eliminarUsuario(id);
      if (exito) {
        cargarUsuarios();
      }
    }
  };

  const handleGuardarUsuario = async (datosUsuario) => {
    const exito = await guardarUsuario(datosUsuario);
    console.log(exito);
    if (exito) {
      setVista("tabla");
      cargarUsuarios();
    }
  };



  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
      },

      {
        accessorKey: "nombres",
        header: "Nombre Completo",

        cell: ({ row }) =>
          `${row.original.nombres} ${row.original.apellidos}`,
      },

      {
        accessorKey: "correo",
        header: "Email",
      },

      {
        accessorKey: "rol_id", // <-- Cambiado a rol_id
        header: "Rol",
        cell: ({ getValue, row }) => {
          const val = Number(getValue() || row.original.rol);
          const roles = {
            1: { label: "Admin", clase: "bg-purple-100 text-purple-700" },
            2: { label: "Cliente", clase: "bg-blue-100 text-blue-700" },
            3: { label: "Vendedor", clase: "bg-amber-100 text-amber-700" },
          };
          const rol = roles[val] || roles[2];
          return (
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${rol.clase}`}
            >
              {rol.label}
            </span>
          );
        },
      },

      {
        accessorKey: "fecha_creacion",
        header: "Registro",

        cell: ({ getValue }) =>
          new Date(getValue()).toLocaleDateString(),
      },

      {
        id: "acciones",
        header: "Acciones",

        cell: ({ row }) => (
          <AccionesFila
            nombre={`${row.original.nombres} ${row.original.apellidos}`}
            onEditar={() => handleEditar(row.original)}
            onEliminar={() => handleEliminar(row.original.id)}
          />
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: usuariosPaginados,

    columns,

    state: {
      pagination,
      sorting,
    },

    onPaginationChange: setPagination,

    onSortingChange: handleSortingChange,

    getCoreRowModel: getCoreRowModel(),

    manualPagination: true,

    manualSorting: true,

    enableMultiSort: false,

    sortDescFirst: false,

    pageCount: Math.ceil(totalUsuarios / pagination.pageSize),
  });

  return (
    <AdminLayout activeTab="usuarios">
      <div className="space-y-8">
        <Toaster position="bottom-right"/>
        {/* Renderizado condicional entre Formulario y Tabla */}
        {vista === "formulario" ? (
          <UserForm
            usuario={usuarioEditando}
            onSave={handleGuardarUsuario}
            onCancel={() => setVista("tabla")}
          />
        ) : (
          <>
            {/* Header de la Tabla */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <UserIcon className="h-8 w-8 text-[#14432F]" />
                  Gestión de Usuarios
                </h1>
                <p className="text-slate-500 mt-2 font-medium">
                  Administra los accesos y roles de la plataforma.
                </p>
              </div>

              <button
                onClick={handleCrearNuevo}
                className="flex items-center gap-2 px-5 py-3 bg-[#14432F] hover:bg-[#0E3323] text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-green-900/20"
              >
                <PlusIcon className="h-5 w-5" />
                Nuevo Usuario
              </button>
            </div>

            {/* Contenedor de la Tabla */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:flex-wrap lg:items-end gap-4">
                <div className="flex flex-col gap-1 w-full lg:w-80">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Buscar
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre o correo..."
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
                    Rol
                  </label>
                  <select
                    value={filtros.rol_id}
                    onChange={(e) => cambiarFiltro("rol_id", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                  >
                    <option value="">Todos los roles</option>
                    <option value="1">Admin</option>
                    <option value="2">Cliente</option>
                    <option value="3">Vendedor</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1 w-full lg:w-44">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Registro desde
                  </label>
                  <input
                    type="date"
                    value={filtros.fecha_desde}
                    max={filtros.fecha_hasta || undefined}
                    onChange={(e) => cambiarFiltro("fecha_desde", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1 w-full lg:w-44">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Registro hasta
                  </label>
                  <input
                    type="date"
                    value={filtros.fecha_hasta}
                    min={filtros.fecha_desde || undefined}
                    onChange={(e) => cambiarFiltro("fecha_hasta", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                  />
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
                {loadingUsers ? (
                  <div className="py-16 text-center text-slate-500 font-medium">
                    Cargando usuarios...
                  </div>
                ) : usuariosPaginados.length === 0 ? (
                  <div className="py-16 text-center text-slate-500 font-medium">
                    No se encontraron usuarios con esos filtros.
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

              {/* Paginación */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 border-t border-slate-100">
                <div className="text-sm text-slate-500 font-medium">
                  Mostrando {usuariosPaginados.length} de {totalUsuarios} usuarios
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
    </AdminLayout>
  );
};

export default AdminUsers;