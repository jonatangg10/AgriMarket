import { useContext, useMemo, useState, useEffect } from "react";

import AdminLayout from "../components/AdminLayout";

import { UserContext } from "../context/UserContext";
import UserForm from "../components/UserForm";

import {
  PencilIcon,
  TrashIcon,
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

  const [usuarioEditando, setUsuarioEditando] = useState(null);

  const [usuariosPaginados, setUsuariosPaginados] = useState([]);

  const [totalUsuarios, setTotalUsuarios] = useState(0);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const cargarUsuarios = async () => {
    const { usuarios, total } = await obtenerUsuariosPaginados({
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      search: globalFilter,
    });

    setUsuariosPaginados(usuarios);
    setTotalUsuarios(total);
  };

  useEffect(() => {
    if (vista === "tabla") {
      cargarUsuarios();
    }
  }, [pagination, globalFilter, vista]);

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
      if (exito) cargarUsuarios();
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
          const val = getValue() || row.original.rol;
          const isAdmin = val === 1 || val === "admin";
          return (
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${isAdmin
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
                }`}
            >
              {isAdmin ? "Admin" : "Cliente"}
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleEditar(row.original)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
              title="Editar"
            >
              <PencilIcon className="h-5 w-5" />
            </button>

            <button
              onClick={() => handleEliminar(row.original.id)}
              className="text-red-600 hover:text-red-800 transition-colors"
              title="Eliminar"
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
    data: usuariosPaginados,

    columns,

    state: {
      pagination,
    },

    onPaginationChange: setPagination,

    getCoreRowModel: getCoreRowModel(),

    manualPagination: true,

    pageCount: Math.ceil(totalUsuarios / pagination.pageSize),
  });

  return (
    <AdminLayout activeTab="usuarios">
      <div className="space-y-8">
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
                  <UserIcon className="h-8 w-8 text-blue-600" />
                  Gestión de Usuarios
                </h1>
                <p className="text-slate-500 mt-2 font-medium">
                  Administra los accesos y roles de la plataforma.
                </p>
              </div>

              <button
                onClick={handleCrearNuevo}
                className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20"
              >
                <PlusIcon className="h-5 w-5" />
                Nuevo Usuario
              </button>
            </div>

            {/* Contenedor de la Tabla */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <input
                  type="text"
                  placeholder="Buscar por nombre o correo..."
                  value={globalFilter}
                  onChange={(e) => {
                    setGlobalFilter(e.target.value);
                    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                  }}
                  className="w-full md:w-96 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                />
              </div>

              <div className="overflow-x-auto">
                {loadingUsers ? (
                  <div className="py-16 text-center text-slate-500 font-medium">
                    Cargando usuarios...
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
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
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