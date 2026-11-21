import { useContext } from "react";
import { Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ChevronLeftIcon, ShoppingCartIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Modal from "./Modal";
import Carrito from "./Carrito";
import Comprar from "./Comprar";
import Producto from "./Producto";
import { CarritoContext } from "../context/CarritoContext";

/**
 * Estructura común de las páginas "Ofertas" y "Últimos ingresos":
 * navbar, encabezado, grilla de productos, carrito y footer.
 */
const ListadoProductosPagina = ({ titulo, descripcion, productos, cargando, error, vacio, children }) => {
  const { carritoVisible, setCarritoVisible, comprarVisible, setComprarVisible, agregarAlCarrito } =
    useContext(CarritoContext);

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7F1]">
      <Navbar onAbrirCarrito={() => setCarritoVisible(true)} />
      <Toaster position="bottom-right" />

      <main className="mx-auto w-full max-w-6xl flex-grow px-4 pb-14 pt-[124px]">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-[#14432F] hover:underline"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Volver al inicio
        </Link>

        <h1 className="text-3xl font-extrabold tracking-tight text-[#17261D] sm:text-4xl">{titulo}</h1>
        {descripcion && <p className="mt-2 max-w-2xl text-[#4F6355]">{descripcion}</p>}

        {children}

        <div className="mt-8">
          {cargando ? (
            <div className="flex justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-[#14432F]"></div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-red-700">
              {error}
            </div>
          ) : productos.length === 0 ? (
            <div className="rounded-2xl border border-[#E1E8DA] bg-white p-10 text-center text-[#4F6355]">
              {vacio}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {productos.map((prod) => (
                <Producto key={prod.id} producto={prod} agregarAlCarrito={agregarAlCarrito} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Modal isOpen={carritoVisible} onClose={() => setCarritoVisible(false)} title="Tu carrito" icon={ShoppingCartIcon}>
        <Carrito />
      </Modal>
      <Modal isOpen={comprarVisible} onClose={() => setComprarVisible(false)} title="Finaliza tu compra" icon={CreditCardIcon}>
        <Comprar />
      </Modal>

      <Footer />
    </div>
  );
};

export default ListadoProductosPagina;
