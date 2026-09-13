import { IoAdd } from "react-icons/io5";
import { Link } from "react-router-dom";

const Producto = ({ producto, agregarAlCarrito }) => {
  // Estilo de stock tipo "píldora" (Badge) igual que en tu Admin
  const getStockBadge = () => {
    if (producto.stock <= 0) return 'bg-red-100 text-red-700';
    if (producto.stock <= 5) return 'bg-orange-100 text-orange-700';
    return 'bg-green-100 text-green-700';
  };

  // Color de etiqueta de oferta/nuevo
  const badgeColor = producto.etiqueta?.includes('-') ? 'bg-pink-600' : 'bg-yellow-500';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col h-full">
      <div className="relative group">
        {/* Etiqueta de descuento o estado */}
        {producto.etiqueta && (
          <div className={`absolute top-3 left-3 z-10 ${badgeColor} text-white text-[10px] uppercase font-black px-2 py-1 rounded-md shadow-sm`}>
            {producto.etiqueta}
          </div>
        )}

        {/* Imagen: Ahora cubriendo el ancho completo sin padding */}
        <Link to={`/producto/${producto.id}`} className="block overflow-hidden bg-gray-50">
          <img 
            src={producto.imagen} 
            alt={producto.nombre} 
            className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>

        {/* Overlay de Agotado */}
        {producto.stock <= 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold text-sm tracking-widest shadow-xl">
              AGOTADO
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        {/* Título y Precio */}
        <div className="mb-3">
          <Link to={`/producto/${producto.id}`}>
            <h3 className="font-bold text-gray-800 text-base leading-tight hover:text-blue-600 transition-colors line-clamp-2 min-h-[2.5rem]">
              {producto.nombre}
            </h3>
          </Link>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black text-gray-900">{producto.vendedor_nombres} {producto.vendedor_apellidos}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black text-gray-900">${producto.precio}</span>
          </div>
        </div>

        {/* Información de Stock con el estilo de la tabla Admin */}
        <div className="mb-4">
          <span className={`text-[11px] font-bold px-2 py-1 rounded-md uppercase tracking-tighter ${getStockBadge()}`}>
            {producto.stock > 0 
              ? `${producto.stock} Unidades disponibles` 
              : 'Sin stock disponible'}
          </span>
        </div>

        {/* Botón de acción */}
        <div className="mt-auto">
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
    </div>
  );
};

export default Producto;