import React, { useContext, useState, useEffect } from 'react';
import Producto from './components/Producto';
import Navbar from './components/Navbar';
import Modal from './components/Modal';
import LogoCarousel from './components/LogoCarousel';
import Contact from './components/Contacto';
import Footer from './components/Footer';
import './App.css';
import { Toaster } from 'react-hot-toast';
import ImageCarousel from './components/ImageCarousel';
import { CarritoContext } from "./context/CarritoContext";
import Carrito from './components/Carrito';
import Comprar from './components/Comprar';
import Filtros from './components/Filtros';
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

function App() {
  const {
    categorias,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    carritoVisible,
    setCarritoVisible,
    agregarAlCarrito,
    obtenerProductosPaginados,
    error,
    comprarVisible,
    setComprarVisible,
    eliminarDelCarrito
  } = useContext(CarritoContext);

  const [productosPaginados, setProductosPaginados] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalProductos, setTotalProductos] = useState(0);
  const [loadingLocal, setLoadingLocal] = useState(true);
  const PAGE_SIZE = 12;

  useEffect(() => {
    const cargarDatos = async () => {
      setLoadingLocal(true);
      const filtro = categoriaSeleccionada === "todos" ? "" : categoriaSeleccionada;

      const res = await obtenerProductosPaginados({
        page: paginaActual,
        pageSize: PAGE_SIZE,
        categoria: filtro
      });

      setProductosPaginados(res.productos || []);
      setTotalProductos(res.total || 0);
      setLoadingLocal(false);
    };

    cargarDatos();
  }, [paginaActual, categoriaSeleccionada]);

  useEffect(() => {
    setPaginaActual(1);
  }, [categoriaSeleccionada]);


  const restarStocklocal = (producto) => {//cuando agreguen altera el local de productos paginados peero no llama a bd que haga que recargue
    agregarAlCarrito(producto);
    setProductosPaginados(
      (prev) =>
        prev.map((p) => (p.id === producto.id ? { ...p, stock: p.stock - 1 } : p))
    );
  }
    const sumarStocklocal = (producto, eliminarTodo = false) => {
      const cantidadARestaurar = eliminarDelCarrito(producto, eliminarTodo);
      console.log(cantidadARestaurar)
      setProductosPaginados(
        (prev) =>
        prev.map((p) =>p.id === producto ? { ...p, stock: p.stock + cantidadARestaurar } : p)
      );
    }
    const totalPaginas = Math.ceil(totalProductos / PAGE_SIZE);

    if (error) return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onAbrirCarrito={() => setCarritoVisible(true)} />
        <ImageCarousel />
        <div className="container mx-auto px-4 pt-10">
          <Toaster position="bottom-right" />
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Productos Destacados</h1>
          <Filtros
            categorias={categorias}
            categoriaSeleccionada={categoriaSeleccionada}
            onCambiarCategoria={setCategoriaSeleccionada}
          />
          {loadingLocal ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productosPaginados.map(prod => (
                  <Producto
                    key={prod.id}
                    producto={prod}
                    agregarAlCarrito={restarStocklocal}
                  />
                ))}
              </div>
              {/* CONTROLES DE PAGINACIÓN ESTILO ADMIN (IGUAL A LA IMAGEN) */}
              {totalPaginas > 1 && (
                <div className="mt-12 mb-10 flex items-center justify-between border-t border-gray-200 pt-6">
                  <div className="text-sm text-gray-600 font-medium">
                    Página <span className="text-gray-900">{paginaActual}</span> de <span className="text-gray-900">{totalPaginas}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setPaginaActual(p => Math.max(1, p - 1));
                        window.scrollTo({ top: 500, behavior: 'smooth' });
                      }}
                      disabled={paginaActual === 1}
                      className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                    >
                      <ChevronLeftIcon className="h-4 w-4 mr-1" />
                      Anterior
                    </button>
                    <button
                      onClick={() => {
                        setPaginaActual(p => Math.min(totalPaginas, p + 1));
                        window.scrollTo({ top: 500, behavior: 'smooth' });
                      }}
                      disabled={paginaActual === totalPaginas}
                      className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                    >
                      Siguiente
                      <ChevronRightIcon className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <Modal isOpen={carritoVisible}  onClose={() => setCarritoVisible(false)} title="🛒 Tu Carrito">
          <Carrito Agregar={restarStocklocal} Eliminar={sumarStocklocal}/>
        </Modal>
        <Modal isOpen={comprarVisible} onClose={() => setComprarVisible(false)} title="✅ Finaliza tu compra">
          <Comprar />
        </Modal>
        <LogoCarousel />
        <Contact />
        <Footer />
      </div>
    );
  }

  export default App;