import React, { useContext } from 'react';
import { CarritoContext } from '../context/CarritoContext';
import { toast } from 'react-hot-toast';

const Carrito = ({Eliminar,Agregar}) => {
  const {
    carrito,
    finalizarCompra,
  } = useContext(CarritoContext);

  const total = carrito.reduce(
    (sum, item) => sum + (item.precio * item.cantidad),
    0
  );

  return (
    <div>
      {carrito.length === 0 ? (
        <p className="text-gray-500">Tu carrito está vacío</p>
      ) : (
        <>
          <ul className="space-y-4">
            {carrito.map((item) => (
              <li key={item.id} className="border-b pb-4">
                <div className="flex justify-between">
                  <div>
                    <span className="font-medium">{item.nombre}</span>
                    <div className="text-sm text-gray-500">
                      ${item.precio.toFixed(2)} c/u
                    </div>
                  </div>
                  <span className="font-semibold">
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center mt-2 space-x-2">
                  <button
                    onClick={() => Eliminar(item.id)}
                    className="px-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{item.cantidad}</span>
                  <button
                    onClick={() => {
                      if (item.stock > 0) {
                        Agregar(item);
                      } else {
                        toast.error('Producto agotado');
                      }
                    }}
                    className="px-2 bg-gray-200 rounded hover:bg-gray-300"
                    disabled={item.stock <= 0}
                  >
                    +
                  </button>
                  <button
                    onClick={() => Eliminar(item.id, true)}
                    className="ml-auto text-red-500 text-sm hover:text-red-700"
                  >
                    Eliminar
                  </button>
                </div>

                {item.stock !== undefined && item.stock < 3 && (
                  <div className="text-xs text-yellow-600 mt-1">
                    {item.stock === 0
                      ? '¡Agotado!'
                      : `Solo quedan ${item.stock} en stock`}
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between font-bold text-lg mb-2">
              <span>Subtotal:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 mb-4">
              <span>Envío:</span>
              <span>Gratis</span>
            </div>
            <div className="flex justify-between font-bold text-xl border-t pt-2">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button
              className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
              onClick={finalizarCompra}
            >
              Finalizar Compra
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Carrito;