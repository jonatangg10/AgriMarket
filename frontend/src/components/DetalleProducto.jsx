import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { CarritoContext } from "../context/CarritoContext";
import Modal from "./Modal";
import Carrito from "./Carrito";
import Comprar from "./Comprar";
import { Toaster } from 'react-hot-toast';


const DetalleProducto = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const { carritoVisible, setCarritoVisible, agregarAlCarrito, setComprarVisible, comprarVisible } = useContext(CarritoContext);

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const res = await fetch(`https://agrimarket-yfbo.onrender.com/api/productos`);
        const data = await res.json();
        const encontrado = data.find(p => p.id === parseInt(id));
        setProducto(encontrado);
      } catch (err) {
        console.error("Error cargando producto:", err);
      }
    };

    fetchProducto();
  }, [id]);

  if (!producto) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Cargando producto...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onAbrirCarrito={() => setCarritoVisible(true)} />

      <main className="flex-grow container mx-auto px-4 pt-24 pb-14">
        <div className="mb-6">
          <Link to="/" className="text-blue-600 hover:underline inline-flex items-center">
            ← Volver
          </Link>
          <div className="text-sm text-gray-500 mt-1">
            {producto.categoria || "General"} / {producto.nombre}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 bg-white p-6 rounded-lg shadow-md">
          <div className="lg:w-1/2 flex justify-center">
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="max-h-96 w-auto rounded-lg object-contain"
            />
          </div>

          <div className="lg:w-1/2">
            <h1 className="text-3xl font-bold mb-3">{producto.nombre}</h1>

            <div className="mb-4">
              <p className="text-2xl font-bold text-gray-800">
                ${producto.precio.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
              </p>
              <p className={`text-sm ${producto.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {producto.stock > 0 ? `Disponible (${producto.stock} unidades)` : "Agotado"}
              </p>
            </div>

            <p className="text-gray-700 mb-5">
              Taza de alta calidad con diseño elegante y duradero. Perfecta para desarrolladores y ocasiones especiales.
            </p>

            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Características:</h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>Material: Porcelana de alta resistencia</li>
                <li>Capacidad: 350ml</li>
                <li>Lavable en lavavajillas y apto para microondas</li>
                <li>Diseño: Exclusivo JavaScript</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded font-medium transition-colors"
                onClick={() => {
                  agregarAlCarrito(producto);
                  setCarritoVisible(true);
                }}
              >
                Agregar al carrito
              </button>

              <button
                className="border border-gray-300 hover:bg-gray-100 py-2 px-6 rounded font-medium transition-colors"
                onClick={() => {
                  agregarAlCarrito(producto);
                  setComprarVisible(true);
                }}
              >
                Comprar ahora
              </button>
            </div>

            <div className="flex flex-wrap gap-4 text-sm pt-4 border-t border-gray-200">
              <div>
                <p className="font-medium">Envío rápido</p>
                <p className="text-gray-600">Recibido en 2-5 días hábiles</p>
              </div>
              <div>
                <p className="font-medium">Garantía</p>
                <p className="text-gray-600">Devolución en 30 días</p>
              </div>
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