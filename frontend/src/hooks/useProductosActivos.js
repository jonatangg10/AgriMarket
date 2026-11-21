import { useEffect, useState } from "react";

const API = "https://agrimarket-yfbo.onrender.com/api";

const obtenerUrlImagen = (ruta) => {
  if (!ruta) return "/images/placeholder.jpg";
  if (ruta.startsWith("/uploads/")) return `https://agrimarket-yfbo.onrender.com${ruta}`;
  return ruta;
};

/**
 * Carga TODOS los productos activos (con vendedor y municipio),
 * recorriendo las páginas de /productos/paginados (máx. 50 por página).
 */
const useProductosActivos = () => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      setCargando(true);
      setError(null);
      try {
        const PAGE_SIZE = 50;
        let pagina = 1;
        let todos = [];
        let total = Infinity;

        while (todos.length < total && pagina <= 20) {
          const res = await fetch(
            `${API}/productos/paginados?page=${pagina}&pageSize=${PAGE_SIZE}&estado_id=1`
          );
          if (!res.ok) throw new Error("No se pudieron cargar los productos");
          const data = await res.json();
          const lote = data.productos || [];
          total = data.total || 0;
          todos = todos.concat(lote);
          if (lote.length === 0) break;
          pagina++;
        }

        if (!cancelado) {
          setProductos(
            todos
              .filter((p) => Number(p.estado_id) === 1)
              .map((p) => ({ ...p, imagen: obtenerUrlImagen(p.imagen) }))
          );
        }
      } catch (err) {
        if (!cancelado) setError(err.message);
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  return { productos, cargando, error };
};

export default useProductosActivos;
