import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FiBell,
  FiMenu,
  FiX,
  FiLogOut,
  FiBox,
} from "react-icons/fi";

import { InboxArrowDownIcon } from "@heroicons/react/24/outline";

import { useAuth } from "../context/AuthContext";

const ProductorLayout = ({ children, activeTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { logout, usuario } = useAuth();
  const navigate = useNavigate();

  const [fechaInfo, setFechaInfo] = useState({
    diaSemana: "",
    fechaCompleta: "",
  });

  useEffect(() => {
    const obtenerFechaBogota = () => {
      const ahora = new Date();

      const formateadorDia = new Intl.DateTimeFormat("es-CO", {
        timeZone: "America/Bogota",
        weekday: "long",
      });

      const formateadorFecha = new Intl.DateTimeFormat("es-CO", {
        timeZone: "America/Bogota",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const diaString = formateadorDia.format(ahora);

      const diaSemana =
        diaString.charAt(0).toUpperCase() +
        diaString.slice(1);

      let fechaString = formateadorFecha.format(ahora);

      fechaString = fechaString
        .replace(/de\s/g, "")
        .replace(/(\b[a-z])/g, (l) =>
          l.toUpperCase()
        )
        .replace(/\s(\d{4})$/, ", $1");

      setFechaInfo({
        diaSemana,
        fechaCompleta: fechaString,
      });
    };

    obtenerFechaBogota();

    const intervalo = setInterval(
      obtenerFechaBogota,
      60000
    );

    return () => clearInterval(intervalo);
  }, []);

  const handleLogout = () => {
    navigate("/");
    setTimeout(() => logout(), 50);
  };

  const menuItems = [
    {
      id: "productos",
      label: "Mis Productos",
      icon: FiBox,
      path: "/productor-solicitudes", //aun no se crea
    },
    {
      id: "solicitudes",
      label: "Mis Solicitudes",
      icon: InboxArrowDownIcon,
      path: "/productor-solicitudes",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Overlay Mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-72
          bg-white border-r border-slate-200
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
          md:translate-x-0
        `}
      >
        {/* Top */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#14432F]">
                🌱 AgriMarket
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Panel de Productor
              </p>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-slate-500"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                onClick={() =>
                  setIsSidebarOpen(false)
                }
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-2xl
                  text-sm font-bold transition-all
                  ${
                    activeTab === item.id
                      ? "bg-[#14432F] text-white shadow-lg shadow-green-900/20"
                      : "text-slate-600 hover:bg-slate-100"
                  }
                `}
              >
                <item.icon className="w-5 h-5" />

                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* User */}
        <div className="p-4 border-t border-slate-100 space-y-4">
          <div className="bg-slate-100 rounded-2xl p-4">
            <h4 className="text-sm font-bold text-slate-800">
              {`${usuario?.nombres?.split(" ")[0] || ""} ${
                usuario?.apellidos?.split(" ")[0] || ""
              }`}
            </h4>

            <p className="text-[11px] uppercase font-semibold text-emerald-600 mt-1">
              Agricultor Aliado
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <FiLogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col md:ml-72 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 h-20 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-slate-700"
            >
              <FiMenu className="w-6 h-6" />
            </button>

            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-900">
                Mi Tienda Agrícola
              </h1>

              <p className="text-xs text-slate-400">
                Gestión de productos y ventas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <button className="relative p-2.5 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all">
              <FiBell className="w-5 h-5 text-slate-700" />
            </button>

            <div className="hidden md:block h-8 w-px bg-slate-200"></div>

            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs text-slate-500">
                {fechaInfo.diaSemana}
              </span>

              <span className="text-sm font-bold text-slate-800">
                {fechaInfo.fechaCompleta}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ProductorLayout;