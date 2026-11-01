import { createContext, useState } from "react";
import { toast } from "react-hot-toast";

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // Categorías de ejemplo para el filtro, luego puedes hacerlas dinámicas
  const categorias = ["Frutas", "Hortalizas", "Tubérculos"]; 

  const obtenerProductosPaginados = async ({ page, pageSize, search = "", categoria = "" }) => {
    try {
      setLoadingProducts(true);
      const queryParams = new URLSearchParams({
        page,
        pageSize,
        search,
        categoria
      });

      const response = await fetch(
        `https://agrimarket-yfbo.onrender.com/api/productos/paginados?${queryParams.toString()}`
      );

      if (!response.ok) throw new Error("Error al obtener productos");

      const data = await response.json();
      return {
        productos: data.productos,
        total: data.total
      };
    } catch (err) {
      console.error("Error ProductContext:", err);
      toast.error("No se pudieron cargar los productos");
      return { productos: [], total: 0 };
    } finally {
      setLoadingProducts(false);
    }
  };

  const eliminarProducto = async (id) => {
    try {
      const response = await fetch(`https://agrimarket-yfbo.onrender.com/api/productos/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || "Error al eliminar");
      
      toast.success("Producto eliminado correctamente");
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  };

  const guardarProducto = async (producto) => {
    try {
      const url = producto.id 
        ? `https://agrimarket-yfbo.onrender.com/api/productos/${producto.id}` 
        : `https://agrimarket-yfbo.onrender.com/api/productos`;
      
      const method = producto.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(producto),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar la solicitud");
      }

      toast.success(producto.id ? "Producto actualizado correctamente" : "Producto creado correctamente");
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  };

  return (
    <ProductContext.Provider value={{ 
      obtenerProductosPaginados, 
      eliminarProducto, 
      guardarProducto,
      loadingProducts,
      categorias
    }}>
      {children}
    </ProductContext.Provider>
  );
};