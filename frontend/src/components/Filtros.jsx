// components/Filtros.jsx
import React from 'react';

const Filtros = ({ categorias, categoriaSeleccionada, onCambiarCategoria }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        {categorias.map(categoria => (
          <button
            key={categoria}
            onClick={() => onCambiarCategoria(categoria)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              categoria === categoriaSeleccionada
                ? 'bg-[#14432F] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {categoria === 'todos' ? 'Todos' : categoria}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Filtros; // Asegúrate de usar export default