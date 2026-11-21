import React, { useContext } from 'react';
import { CarritoContext } from '../context/CarritoContext';
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { esOferta, obtenerDescuento, precioAntes, formatoPrecio } from "../utils/ofertas";

const OfertasTemporales = () => {
  const { productos, agregarAlCarrito } = useContext(CarritoContext);

  // parseInt("-20%") daba -20 y calculaba mal el precio anterior
  const productosOferta = productos.filter(
    (prod) => esOferta(prod) && Number(prod.estado_id) === 1 && prod.stock > 0
  );

  productosOferta.sort(
    (a, b) => (obtenerDescuento(b.etiqueta) || 0) - (obtenerDescuento(a.etiqueta) || 0)
  );

  const ofertasDestacadas = productosOferta.slice(0, 3);

  return (
    <section className="w-full bg-white text-gray-800 py-10 px-0">
      {/* Encabezado con fondo de ancho completo */}
      <div className="w-full bg-gray-100 py-8 mb-10">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-red-700">¡Por tiempo limitado!</h1>
          <p className="text-lg md:text-xl font-medium text-gray-600">OFERTAS SOLO POR 24 HORAS</p>
        </div>
      </div>

      {/* Contenedor de productos a pantalla completa */}
      <div className="w-full overflow-x-auto">
        <div className="flex min-w-max px-4 gap-6 w-full">
          {ofertasDestacadas.map(producto => (
            <div 
              key={producto.id} 
              className="w-[300px] flex-shrink-0 bg-white border rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative">
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="w-full h-56 object-cover"
                />
                {producto.etiqueta && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                    {producto.etiqueta}
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col h-[180px]">
                <h3 className="text-lg font-semibold mb-2">{producto.nombre}</h3>
                <div className="flex items-center gap-2 mb-3">
                  {precioAntes(producto) && (
                    <span className="text-gray-400 line-through text-sm">
                      {formatoPrecio(precioAntes(producto))}
                    </span>
                  )}
                  <span className="text-red-600 font-bold text-lg">{formatoPrecio(producto.precio)}</span>
                </div>
                <button
                  onClick={() => agregarAlCarrito(producto)}
                  className="mt-auto w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded flex items-center justify-center transition-colors"
                >
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  Añadir al carrito
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sección de información adicional */}
      <div className="w-full bg-gray-100 mt-10 py-6">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 max-w-6xl mx-auto">
          <div className="bg-white border border-red-500 text-red-600 font-bold px-6 py-3 rounded-lg shadow-sm">
            <p className="text-lg">COMPRA A 3, 6 O 12 CUOTAS</p>
            <p className="text-2xl">0% INTERÉS</p>
          </div>
          
          <div className="bg-red-600 text-white font-bold px-6 py-3 rounded-lg shadow-sm">
            <p className="text-lg">¡Ofertas Únicas!</p>
            <p className="text-2xl">HASTA 40% OFF</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfertasTemporales;