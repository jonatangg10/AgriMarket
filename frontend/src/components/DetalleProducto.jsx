import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { ChevronLeftIcon, TruckIcon, ShieldCheckIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { CarritoContext } from "../context/CarritoContext";
import Modal from "./Modal";
import Carrito from "./Carrito";
import Comprar from "./Comprar";
import { Toaster } from "react-hot-toast";

// Datos fijos por ahora (aún no existen en la BD)
const UNIDADES = [
  { nombre: "Libra", sufijo: "lb" },
  { nombre: "Kilo", sufijo: "kg" },
  { nombre: "Bulto", sufijo: "bulto" },
];

const CARACTERISTICAS = [
  { etiqueta: "Origen", valor: "Cundinamarca, Colombia" },
  { etiqueta: "Cosecha", valor: "Directa del productor" },
  { etiqueta: "Conservación", valor: "Lugar fresco, lejos del sol" },
  { etiqueta: "Empaque", valor: "Cadena de frío y empaque protegido" },
];

const BENEFICIOS = [
  { icono: TruckIcon, titulo: "Envío en 24 h", texto: "A toda Cundinamarca" },
  { icono: BanknotesIcon, titulo: "Pago contra entrega", texto: "También PSE y Nequi" },
  { icono: ShieldCheckIcon, titulo: "Garantía de frescura", texto: "Devolución en 30 días" },
];

const DetalleProducto = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [unidad, setUnidad] = useState("Kilo");

  const { carritoVisible, setCarritoVisible, agregarAlCarrito, setComprarVisible, comprarVisible } =
    useContext(CarritoContext);

  useEffect(() => {
    const fetchProducto = async () => {
      setCargando(true);
      try {
        const res = await fetch(`https://agrimarket-yfbo.onrender.com/api/productos`);
        const data = await res.json();
        const encontrado = data.find((p) => p.id === parseInt(id));
        setProducto(encontrado || null);
      } catch (err) {
        console.error("Error cargando producto:", err);
      } finally {
        setCargando(false);
      }
    };

    fetchProducto();
  }, [id]);

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7F1]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-[#14432F]"></div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F5F7F1] px-4 text-center">
        <p className="text-lg font-bold text-[#17261D]">No encontramos este producto.</p>
        <Link to="/" className="font-bold text-[#14432F] hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const sufijoUnidad = UNIDADES.find((u) => u.nombre === unidad)?.sufijo;

  const agotado = producto.stock <= 0;
  const pocasUnidades = producto.stock > 0 && producto.stock <= 5;

  const stockBadge = agotado
    ? "bg-red-100 text-red-800"
    : pocasUnidades
    ? "bg-[#FBD9C9] text-[#6B2A0E]"
    : "bg-[#E3F1E7] text-[#14532D]";

  const stockTexto = agotado
    ? "Agotado"
    : pocasUnidades
    ? `Quedan ${producto.stock} unidades`
    : `${producto.stock} unidades disponibles`;

  const vendedor = [
    producto.vendedor_nombres?.split(" ")[0],
    producto.vendedor_apellidos?.split(" ")[0],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7F1]">
      <Navbar onAbrirCarrito={() => setCarritoVisible(true)} />

      {/* pt-[124px] = encabezado fijo (100px) + 24px de aire */}
      <main className="mx-auto w-full max-w-6xl flex-grow px-4 pb-14 pt-[124px]">
        {/* Migas de pan */}
        <div className="mb-5 flex flex-wrap items-center gap-2 text-sm">
          <Link
            to="/"
            className="inline-flex items-center gap-1 font-bold text-[#14432F] hover:underline"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Volver
          </Link>
          <span className="text-[#4F6355]">
            / {producto.categoria || "General"} / {producto.nombre}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-8 rounded-2xl border border-[#E1E8DA] bg-white p-5 sm:p-8 lg:grid-cols-2">
          {/* Imagen */}
          <div className="relative overflow-hidden rounded-2xl bg-[#DCE6D3]">
            {producto.etiqueta && (
              <span
                className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-xs font-bold ${
                  producto.etiqueta.includes("-")
                    ? "bg-[#FBD9C9] text-[#6B2A0E]"
                    : "bg-[#F6D77A] text-[#4A3500]"
                }`}
              >
                {producto.etiqueta}
              </span>
            )}
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="h-72 w-full object-cover sm:h-96 lg:h-full lg:min-h-[420px]"
            />
          </div>

          {/* Información */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#17261D] sm:text-4xl">
              {producto.nombre}
            </h1>

            {vendedor && (
              <p className="mt-2 text-sm text-[#4F6355]">
                Vendido por <span className="font-bold text-[#17261D]">{vendedor}</span>
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-baseline gap-3">
              <span className="text-4xl font-extrabold text-[#17261D]">
                ${producto.precio.toLocaleString("es-CO")}
                <span className="ml-1 text-sm font-medium text-[#4F6355]">/ {sufijoUnidad}</span>
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${stockBadge}`}>
                {stockTexto}
              </span>
            </div>

            {/* Selector de unidad (visual por ahora) */}
            <div className="mt-5">
              <p className="mb-2 text-sm font-bold text-[#17261D]">Presentación</p>
              <div className="flex flex-wrap gap-2">
                {UNIDADES.map((u) => (
                  <button
                    key={u.nombre}
                    type="button"
                    aria-pressed={unidad === u.nombre}
                    onClick={() => setUnidad(u.nombre)}
                    className={`min-h-10 rounded-full border px-4 text-sm font-medium transition-colors ${
                      unidad === u.nombre
                        ? "border-[#14432F] bg-[#14432F] text-white"
                        : "border-[#C9D6C0] bg-white text-[#17261D] hover:bg-[#EAF0E2]"
                    }`}
                  >
                    {u.nombre}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-5 leading-relaxed text-[#4F6355]">
              Producto fresco cosechado por familias campesinas de Cundinamarca y entregado
              directamente a tu mesa, sin intermediarios.
            </p>

            <div className="mt-5">
              <h2 className="mb-3 text-lg font-bold text-[#17261D]">Características</h2>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                {CARACTERISTICAS.map((c) => (
                  <div key={c.etiqueta} className="border-b border-[#E1E8DA] pb-2">
                    <dt className="text-xs font-bold uppercase tracking-wide text-[#4F6355]">
                      {c.etiqueta}
                    </dt>
                    <dd className="text-[#17261D]">{c.valor}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <button
              type="button"
              disabled={agotado}
              onClick={() => {
                agregarAlCarrito(producto);
              }}
              className={`mt-6 min-h-12 w-full rounded-xl px-6 py-3 text-base font-bold transition-colors sm:w-auto sm:self-start ${
                agotado
                  ? "cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400"
                  : "bg-[#14432F] text-white hover:bg-[#0E3323] active:scale-[0.98]"
              }`}
            >
              {agotado ? "No disponible" : "Agregar al carrito"}
            </button>

            {/* Beneficios */}
            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-[#E1E8DA] pt-5 sm:grid-cols-3">
              {BENEFICIOS.map(({ icono: Icono, titulo, texto }) => (
                <div key={titulo} className="flex items-start gap-3">
                  <Icono className="mt-0.5 h-6 w-6 shrink-0 text-[#14432F]" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-bold text-[#17261D]">{titulo}</p>
                    <p className="text-xs text-[#4F6355]">{texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Modal isOpen={carritoVisible} onClose={() => setCarritoVisible(false)} title="🛒 Tu Carrito">
        <Carrito />
      </Modal>
      <Modal isOpen={comprarVisible} onClose={() => setComprarVisible(false)} title="✅ Finaliza tu compra">
        <Comprar />
      </Modal>
      <Toaster position="bottom-right" />

      <Footer />
    </div>
  );
};

export default DetalleProducto;