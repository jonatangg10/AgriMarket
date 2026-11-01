import AdminLayout from "../components/AdminLayout";

import {
  FiUsers,
  FiShoppingBag,
  FiArrowUpRight,
  FiArrowDownRight,
} from "react-icons/fi";

import { MdOutlineBarChart } from "react-icons/md";

import { FaDollarSign } from "react-icons/fa";

const Dashboard = () => {
  const recentUsers = [
    {
      id: 1,
      name: "Ana Martínez",
      email: "ana@example.com",
      role: "Admin",
      status: "Activo",
      date: "18 May, 2026",
    },

    {
      id: 2,
      name: "Carlos Gomez",
      email: "carlos@example.com",
      role: "Editor",
      status: "Inactivo",
      date: "15 May, 2026",
    },

    {
      id: 3,
      name: "Sofía Rodríguez",
      email: "sofia@example.com",
      role: "Usuario",
      status: "Activo",
      date: "12 May, 2026",
    },

    {
      id: 4,
      name: "Alejandro Toro",
      email: "alejo@example.com",
      role: "Usuario",
      status: "Pendiente",
      date: "10 May, 2026",
    },
  ];

  return (
    <AdminLayout activeTab="dashboard">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Dashboard
            </h1>

            <p className="text-slate-500 mt-1 font-medium">
              Monitoriza el rendimiento del sistema en tiempo real.
            </p>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-bold transition-all border border-slate-200 shadow-sm">
              Filtros
            </button>

            <button className="px-4 py-2 bg-[#14432F] hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20">
              Generar Reporte
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            {
              id: "sales",
              label: "Ventas Totales",
              val: "$45.2k",
              change: "+12.5%",
              up: true,
              icon: FaDollarSign,
            },

            {
              id: "users",
              label: "Nuevos Usuarios",
              val: "2,350",
              change: "+18.2%",
              up: true,
              icon: FiUsers,
            },

            {
              id: "orders",
              label: "Órdenes Activas",
              val: "12,234",
              change: "-4.1%",
              up: false,
              icon: FiShoppingBag,
            },

            {
              id: "conv",
              label: "Conversión",
              val: "4.23%",
              change: "+2.4%",
              up: true,
              icon: MdOutlineBarChart,
            },
          ].map((stat) => (
            <div
              key={stat.id}
              className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-slate-50 text-[#14432F] border border-slate-100">
                  <stat.icon className="w-5 h-5" />
                </div>

                <span
                  className={`flex items-center gap-1 text-xs font-extrabold px-2 py-1 rounded-lg
                    ${
                      stat.up
                        ? "text-emerald-600 bg-emerald-50"
                        : "text-rose-600 bg-rose-50"
                    }`}
                >
                  {stat.up ? (
                    <FiArrowUpRight className="w-3 h-3" />
                  ) : (
                    <FiArrowDownRight className="w-3 h-3" />
                  )}

                  {stat.change}
                </span>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </p>

                <h3 className="text-3xl font-black text-slate-900 mt-1">
                  {stat.val}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 text-lg mb-6">
              Actividad Semanal
            </h3>

            <div className="flex items-end justify-between gap-3 h-64">
              {[45, 60, 100, 75, 90, 55, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-3"
                >
                  <div
                    className={`w-full rounded-t-xl
                      ${
                        i === 2
                          ? "bg-[#14432F]"
                          : "bg-slate-200"
                      }`}
                    style={{ height: `${h}%` }}
                  ></div>

                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Día {i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">
                Últimos Registros
              </h3>

              <button className="text-sm font-bold text-[#14432F]">
                Ver Detalles
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[11px] font-extrabold uppercase text-slate-400">
                      Usuario
                    </th>

                    <th className="px-6 py-4 text-[11px] font-extrabold uppercase text-slate-400">
                      Rol
                    </th>

                    <th className="px-6 py-4 text-[11px] font-extrabold uppercase text-slate-400">
                      Estado
                    </th>

                    <th className="px-6 py-4 text-[11px] font-extrabold uppercase text-slate-400 text-right">
                      Fecha
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {recentUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900">
                            {user.name}
                          </span>

                          <span className="text-xs text-slate-400">
                            {user.email}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-slate-600">
                        {user.role}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase
                            ${
                              user.status === "Activo"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                : user.status === "Pendiente"
                                ? "bg-amber-50 text-amber-600 border border-amber-200"
                                : "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right text-xs text-slate-400 font-bold">
                        {user.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;