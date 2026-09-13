import { IoAdd } from "react-icons/io5";
import { Link } from "react-router-dom";

const Producto = ({ producto, agregarAlCarrito }) => {
  const getStockBadge = () => {
    if (producto.stock <= 0) return 'bg-red-100 text-red-700';
    if (producto.stock <= 5) return 'bg-orange-100 text-orange-700';
    return 'bg-green-100 text-green-700';
  };

  const badgeColor = producto.etiqueta?.includes('-') ? 'bg-pink-600' : 'bg-yellow-500';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col h-full">
      <Link to={`/producto/${producto.id}`} className="flex flex-col flex-grow">
        <div className="relative group">
          {producto.etiqueta && (
            <div className={`absolute top-3 left-3 z-10 ${badgeColor} text-white text-[10px] uppercase font-black px-2 py-1 rounded-md shadow-sm`}>
              {producto.etiqueta}
            </div>
          )}

          <div className="block overflow-hidden bg-gray-50">
            <img 
              src={producto.imagen} 
              alt={producto.nombre} 
              className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          Ruta:{producto.imagen}
          {producto.stock <= 0 && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold text-sm tracking-widest shadow-xl">
                AGOTADO
              </span>
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <h3 className="font-bold text-gray-800 text-lg leading-tight hover:text-green-700 transition-colors line-clamp-2 min-h-[2.5rem] text-center">
            {producto.nombre}
          </h3>

          <div className="mt-2 mb-2 border-t border-b border-gray-200 py-1 text-center">
            <span className="text-2xl font-extrabold text-gray-900 block leading-none">
              ${producto.precio.toLocaleString('es-CO')}
            </span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className={`text-[11px] font-bold px-2 py-1 rounded-md uppercase tracking-tighter ${getStockBadge()}`}>
              {producto.stock > 0 
                ? `${producto.stock} unidades disponibles` 
                : 'Sin stock disponible'}
            </span>
            <span className="text-sm text-gray-600 font-medium">
              🧑‍🌾 {producto.vendedor_nombres} {producto.vendedor_apellidos}
            </span>
          </div>
        </div>
      </Link>

      {/* Botón de acción fuera del Link */}
      <div className="p-5 pt-0">
        <button
          onClick={() => agregarAlCarrito(producto)}
          disabled={producto.stock <= 0}
          className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-sm ${
            producto.stock > 0
              ? 'bg-green-600 hover:bg-green-700 text-white active:scale-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
          }`}
        >
          {producto.stock > 0 ? (
            <>
              <IoAdd className="text-lg" />
              Añadir al carrito
            </>
          ) : (
            'No disponible'
          )}
        </button>
      </div>
    </div>
  );
};

export default Producto;
