import {
  ShoppingCartIcon,
  UserCircleIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon,
  WrenchScrewdriverIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

import { useContext, useState, useEffect, useRef } from "react";
import { CarritoContext } from "../context/CarritoContext";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const theme = {
  textPrimary: "text-gray-900",
  textMuted: "text-gray-500",
  accentText: "text-blue-600",
  accentBg: "bg-blue-600",
  accentHover: "hover:text-blue-700",
  transition: "transition-all duration-300 ease-in-out",
};

function Navbar() {
  const { carrito, setCarritoVisible, categorias } =
    useContext(CarritoContext);

  const { isAuthenticated, logout, usuario } = useAuth();

  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const timeoutRef = useRef(null);
  const userMenuRef = useRef(null);

  const totalItems = carrito.reduce((t, i) => t + i.cantidad, 0);

  const isAdmin = usuario?.rol === "admin";

  const handleMouseEnter = (menuName) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenMenu(menuName);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpenMenu(null), 250);
  };

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);

    const onClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("mousedown", onClickOutside);

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setUserMenuOpen(false);
    navigate("/");
    setTimeout(() => logout(), 50);
  };

  // Scroll suave hacia la sección inicio
  const scrollToInicio = () => {
    const section = document.getElementById("inicio");

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const navLinks = [
    { name: "Inicio", action: scrollToInicio },

    {
      name: "Categorías",
      dropdown: categorias
        .filter((cat) => cat.toLowerCase() !== "todos")
        .map((cat) => ({
          name: cat.charAt(0).toUpperCase() + cat.slice(1),
          path: `/categorias/${cat.toLowerCase()}`,
        })),
    },

    { name: "Ofertas", path: "/ofertas" },

    {
      name: "Novedades",
      dropdown: [
        { name: "Nuevos productos", path: "/novedades" },
        { name: "Últimos ingresos", path: "/ultimos-ingresos" },
      ],
    },

    {
      name: "Soporte",
      dropdown: [
        { name: "Centro de ayuda", path: "/soporte" },
        { name: "Contacto", path: "/contacto" },
        { name: "Devoluciones", path: "/devoluciones" },
      ],
    },

    { name: "Mis pedidos", path: "/pedidos", auth: false },
  ];

  return (
    <nav className="bg-white fixed top-0 w-full z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">

        {/* Logo */}
        <div className="flex items-center gap-3">
          {isMobile && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-gray-50 rounded-lg"
            >
              <Bars3Icon className="h-6 w-6 text-gray-900" />
            </button>
          )}

          <Link
            to="/"
            className="text-xl font-bold text-gray-900 tracking-tight"
          >
            🛍️ AgrilMarket
          </Link>
        </div>

        {/* Desktop Menu */}
        {!isMobile && (
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() => handleMouseEnter(link.name)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="px-3 py-2">

                  {/* LINK NORMAL */}
                  {link.path && !link.dropdown && (!link.auth || isAuthenticated) && (
                    <Link
                      to={link.path}
                      className={`text-sm font-medium ${theme.transition} ${
                        link.highlight
                          ? theme.accentText
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {link.name}
                    </Link>
                  )}

                  {/* BOTÓN ACCIÓN */}
                  {link.action && (
                    <button
                      onClick={link.action}
                      className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-all"
                    >
                      {link.name}
                    </button>
                  )}

                  {/* DROPDOWN */}
                  {!link.path && !link.action && (
                    <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900">
                      {link.name}

                      <ChevronDownIcon
                        className={`h-3 w-3 transition-transform duration-300 ${
                          openMenu === link.name ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* DROPDOWN MENU */}
                {link.dropdown && (
                  <div
                    className={`absolute left-0 top-full min-w-[180px] pt-1 ${
                      theme.transition
                    } ${
                      openMenu === link.name
                        ? "opacity-100 visible translate-y-0"
                        : "opacity-0 invisible translate-y-2"
                    }`}
                  >
                    <div className="bg-white border border-gray-100 rounded-lg shadow-xl py-1">
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.name}
                          to={item.path}
                          className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Icons Right */}
        <div className="flex items-center gap-2">

          {/* Carrito */}
          <button
            onClick={() => setCarritoVisible(true)}
            className="p-2 text-gray-900 relative"
          >
            <ShoppingCartIcon className="h-6 w-6" />

            {totalItems > 0 && (
              <span
                className={`absolute top-1 right-1 ${theme.accentBg} text-white text-[10px] h-4 w-4 rounded-full flex items-center justify-center font-bold`}
              >
                {totalItems}
              </span>
            )}
          </button>

          {/* Usuario */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="p-2 text-gray-900 hover:bg-gray-50 rounded-full transition-colors"
            >
              <UserCircleIcon className="h-7 w-7" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-lg shadow-xl py-2 z-50">

                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                      <p className="text-[10px] uppercase font-bold text-gray-400">
                        Bienvenido
                      </p>

                      <p className="text-sm font-bold text-gray-900 truncate">
                        {`${usuario?.nombres?.split(" ")[0] || ""} ${
                          usuario?.apellidos?.split(" ")[0] || ""
                        }`}
                      </p>
                    </div>

                    {isAdmin && (
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <p className="px-4 pb-2 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                          Administración
                        </p>
                                        
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <WrenchScrewdriverIcon className="h-4 w-4 mr-3 text-gray-400" />
                          Panel Administrativo
                        </Link>
                                        
                        <Link
                          to="/admin-productos"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <WrenchScrewdriverIcon className="h-4 w-4 mr-3 text-gray-400" />
                          Administrar Productos
                        </Link>
                                        
                        <Link
                          to="/admin-users"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <WrenchScrewdriverIcon className="h-4 w-4 mr-3 text-gray-400" />
                          Administrar Usuarios
                        </Link>
                      </div>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <div className="px-3 py-1">
                    <Link
                      to="/login"
                      className="flex items-center justify-center w-full py-2 border border-gray-200 rounded-md text-gray-900 text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm"
                    >
                      Iniciar sesión
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;