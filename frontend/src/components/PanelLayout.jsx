import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiBell, FiMenu, FiX, FiLogOut, FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import UserCard from "./UserCard";

const CLAVE_COLAPSADO = "panel_menu_colapsado";

const leerColapsado = () => {
  try {
    return localStorage.getItem(CLAVE_COLAPSADO) === "1";
  } catch {
    return false;
  }
};

const formatearFechaBogota = () => {
  const ahora = new Date();
  const dia = new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", weekday: "long" }).format(ahora);
  const fecha = new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
    .format(ahora)
    .replace(/de\s/g, "")
    .replace(/(\b[a-z])/g, (l) => l.toUpperCase())
    .replace(/\s(\d{4})$/, ", $1");

  return { diaSemana: dia.charAt(0).toUpperCase() + dia.slice(1), fechaCompleta: fecha };
};

/**
 * Estructura de los paneles internos (admin y productor).
 * - Escritorio: menú lateral que se minimiza a solo iconos (se recuerda la preferencia).
 * - Celular/tablet: menú hamburguesa que abre el menú como panel deslizable.
 */
const PanelLayout = ({ children, activeTab, menuItems, subtitulo, titulo, descripcion }) => {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [colapsado, setColapsado] = useState(leerColapsado);
  const [fechaInfo, setFechaInfo] = useState(formatearFechaBogota);

  const { logout, usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const intervalo = setInterval(() => setFechaInfo(formatearFechaBogota()), 60000);
    return () => clearInterval(intervalo);
  }, []);

  // Guarda la preferencia de minimizado
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_COLAPSADO, colapsado ? "1" : "0");
    } catch {
      /* sin almacenamiento disponible: no pasa nada */
    }
  }, [colapsado]);

  // Cierra el menú móvil al cambiar de página
  useEffect(() => {
    setMenuMovilAbierto(false);
  }, [location.pathname]);

  // Menú móvil abierto: bloquea el scroll del fondo y permite cerrar con Escape
  useEffect(() => {
    if (!menuMovilAbierto) return;
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setMenuMovilAbierto(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflowPrevio;
      document.removeEventListener("keydown", onKey);
    };
  }, [menuMovilAbierto]);

  const handleLogout = () => {
    navigate("/");
    setTimeout(() => logout(), 50);
  };

  // En escritorio minimizado se ocultan los textos; en móvil el panel siempre va completo
  const ocultarTexto = colapsado ? "md:hidden" : "";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Fondo oscuro detrás del menú móvil */}
      <div
        onClick={() => setMenuMovilAbierto(false)}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden ${
          menuMovilAbierto ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />

      {/* Menú lateral */}
      <aside
        id="menu-panel"
        className={`fixed top-0 left-0 z-50 flex h-screen w-72 flex-col border-r border-slate-200 bg-white
          transition-[transform,width] duration-300 ease-in-out
          ${menuMovilAbierto ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
          md:translate-x-0 md:shadow-none ${colapsado ? "md:w-20" : "md:w-72"}`}
      >
        {/* Logo */}
        <div className={`flex h-20 shrink-0 items-center border-b border-slate-100 px-5 ${colapsado ? "md:justify-center md:px-0" : ""}`}>
          <Link to="/" className="flex min-w-0 items-center gap-2" title="Ir a la tienda">
            <img src="/favicon.svg" alt="" className="h-9 w-9 shrink-0" />
            <span className={`min-w-0 ${ocultarTexto}`}>
              <span className="block text-xl font-black leading-tight text-[#14432F]">AgrilMarket</span>
              <span className="block truncate text-xs text-slate-400">{subtitulo}</span>
            </span>
          </Link>

          <button
            onClick={() => setMenuMovilAbierto(false)}
            className="ml-auto rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
            aria-label="Cerrar menú"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Opciones */}
        <nav className={`flex-1 space-y-2 overflow-y-auto px-4 py-6 ${colapsado ? "md:px-3" : ""}`}>
          {menuItems.map((item) => {
            const activo = activeTab === item.id;
            return (
              <Link
                key={item.id}
                to={item.path}
                title={colapsado ? item.label : undefined}
                aria-label={item.label}
                aria-current={activo ? "page" : undefined}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all
                  ${colapsado ? "md:justify-center md:px-0" : ""}
                  ${activo ? "bg-[#14432F] text-white shadow-lg shadow-green-900/20" : "text-slate-600 hover:bg-slate-100"}`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className={ocultarTexto}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Usuario + cerrar sesión */}
        <div className={`space-y-3 border-t border-slate-100 p-4 ${colapsado ? "md:px-3" : ""}`}>
          <UserCard usuario={usuario} compacto={colapsado} />

          <button
            onClick={handleLogout}
            title={colapsado ? "Cerrar Sesión" : undefined}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-red-50 hover:text-red-600
              ${colapsado ? "md:justify-center md:px-0" : ""}`}
          >
            <FiLogOut className="h-5 w-5 shrink-0" />
            <span className={ocultarTexto}>Cerrar Sesión</span>
          </button>

          {/* Minimizar / expandir (solo escritorio) */}
          <button
            onClick={() => setColapsado((v) => !v)}
            aria-expanded={!colapsado}
            aria-controls="menu-panel"
            title={colapsado ? "Expandir menú" : "Minimizar menú"}
            className={`hidden w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 md:flex
              ${colapsado ? "md:justify-center md:px-0" : ""}`}
          >
            {colapsado ? <FiChevronsRight className="h-5 w-5" /> : <FiChevronsLeft className="h-5 w-5" />}
            <span className={ocultarTexto}>Minimizar menú</span>
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <div
        className={`flex min-w-0 flex-1 flex-col transition-[margin] duration-300 ease-in-out ${
          colapsado ? "md:ml-20" : "md:ml-72"
        }`}
      >
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMenuMovilAbierto(true)}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-700 hover:bg-slate-100 md:hidden"
              aria-label="Abrir menú"
              aria-expanded={menuMovilAbierto}
              aria-controls="menu-panel"
            >
              <FiMenu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-black text-slate-900 md:text-xl">{titulo}</h1>
              <p className="truncate text-xs text-slate-400">{descripcion}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-4 md:gap-6">
            <button
              className="relative rounded-xl border border-slate-200 bg-slate-50 p-2.5 transition-all hover:bg-slate-100"
              aria-label="Notificaciones"
            >
              <FiBell className="h-5 w-5 text-slate-700" />
            </button>

            <div className="hidden h-8 w-px bg-slate-200 md:block"></div>

            <div className="hidden flex-col items-end sm:flex">
              <span className="text-xs text-slate-500">{fechaInfo.diaSemana}</span>
              <span className="text-sm font-bold text-slate-800">{fechaInfo.fechaCompleta}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
};

export default PanelLayout;
