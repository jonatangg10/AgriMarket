import { createContext, useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import { generarFactura } from "../components/Factura";

export const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  const [productos, setProductos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [carritoVisible, setCarritoVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todos");

  // 🔄 Cargar productos completos
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://agrimarket-yfbo.onrender.com/api/productos");
        if (!response.ok) throw new Error("Error al cargar productos");
        const data = await response.json();

        const productosNormalizados = data.map((prod) => ({
          ...prod,
          categoria: prod.categoria || "general",
        }));

        setProductos(productosNormalizados);
      } catch (err) {
        setError(err.message);
        toast.error("Error al cargar productos");
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  // 🔄 Cargar estados
  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const response = await fetch("https://agrimarket-yfbo.onrender.com/api/estados");
        if (!response.ok) throw new Error("Error al cargar estados");
        const data = await response.json();
        setEstados(data);
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar estados");
      }
    };

    fetchEstados();
  }, []);

  // 🔄 Obtener productos paginados desde el backend
const obtenerProductosPaginados = async ({
  page,
  pageSize,
  search = "",
  categoria = "",
}) => {
  try {
    // Usamos el nuevo endpoint /api/productos/paginados
    const response = await fetch(
      `https://agrimarket-yfbo.onrender.com/api/productos/paginados?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(
        search
      )}&categoria=${encodeURIComponent(categoria)}`
    );

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    // Validamos la estructura de la respuesta
    if (!data.productos || !data.total) {
      throw new Error("Formato de respuesta inválido");
    }

    // data.productos.forEach((p, i) => {
    //   console.log(`🧺 Producto ${i + 1}:`, {
    //     nombre: p.nombre,
    //     imagen: p.imagen,
    //     precio: p.precio,
    //     categoria: p.categoria
    //   });
    // });


    // console.log("Datos paginados recibidos:", {
    //   página: page,
    //   porPágina: pageSize,
    //   productosRecibidos: data.productos.length,
    //   totalProductos: data.total,
    //   filtros: { search, categoria }
    // });

    return {
      productos: data.productos,
      total: data.total
    };

  } catch (err) {
    console.error("Error al obtener productos paginados:", {
      error: err.message,
      params: { page, pageSize, search, categoria }
    });
    return { productos: [], total: 0 };
  }
};

  // 📦 Categorías dinámicas
  const categorias = useMemo(() => {
    const cats = [...new Set(productos.map((prod) => prod.categoria))].sort();
    return ["todos", ...cats];
  }, [productos]);

  // 🔍 Productos filtrados por categoría
  const productosFiltrados = useMemo(() => {
    return categoriaSeleccionada === "todos"
      ? productos
      : productos.filter((prod) => prod.categoria === categoriaSeleccionada);
  }, [productos, categoriaSeleccionada]);

  // 🔁 Actualizar stock en backend
  const actualizarStockBackend = async (productoId, cantidad) => {
    try {
      const response = await fetch(
        `https://agrimarket-yfbo.onrender.com/api/productos/${productoId}/stock`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cantidad }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar stock");
      }

      return true;
    } catch (err) {
      console.error("Error al actualizar stock:", err);
      throw err;
    }
  };

  // 🛒 Agregar producto al carrito
  const agregarAlCarrito = async (producto) => {
    const productoEnTienda = productos.find((p) => p.id === producto.id);
    if (!productoEnTienda || productoEnTienda.stock < 1) {
      toast.error("Producto agotado");
      return;
    }

    try {
      await actualizarStockBackend(producto.id, 1);

      setCarrito((prev) => {
        const existe = prev.find((item) => item.id === producto.id);
        return existe
          ? prev.map((item) =>
              item.id === producto.id
                ? { ...item, cantidad: item.cantidad + 1 }
                : item
            )
          : [...prev, { ...producto, cantidad: 1 }];
      });

      setProductos((prev) =>
        prev.map((p) =>
          p.id === producto.id ? { ...p, stock: p.stock - 1 } : p
        )
      );

      toast.success("Producto agregado al carrito");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ❌ Eliminar producto del carrito
  const eliminarDelCarrito = async (productoId, eliminarTodo = false) => {
    const productoEnCarrito = carrito.find((item) => item.id === productoId);
    if (!productoEnCarrito) return;

    const cantidadARestaurar = eliminarTodo ? productoEnCarrito.cantidad : 1;

    try {
      await actualizarStockBackend(productoId, -cantidadARestaurar);

      setCarrito((prev) =>
        eliminarTodo
          ? prev.filter((item) => item.id !== productoId)
          : prev
              .map((item) =>
                item.id === productoId
                  ? { ...item, cantidad: item.cantidad - 1 }
                  : item
              )
              .filter((item) => item.cantidad > 0)
      );

      setProductos((prev) =>
        prev.map((p) =>
          p.id === productoId
            ? { ...p, stock: p.stock + cantidadARestaurar }
            : p
        )
      );
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // ✅ Finalizar compra
  const finalizarCompra = () => {
    const doc = generarFactura(carrito);
    doc.save(`factura-${Date.now().toString().slice(-6)}.pdf`);
    setCarrito([]);
    toast.success("¡Gracias por tu compra! Factura generada");
    setCarritoVisible(false);
  };

  // 🚫 Inactivar producto
  const inactivarProducto = async (productoId) => {
    try {
      const response = await fetch(
        `https://agrimarket-yfbo.onrender.com/api/productos/${productoId}/estado`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado_id: 2 }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al inactivar producto");
      }

      // Actualizar localmente
      setProductos((prev) =>
        prev.map((p) => (p.id === productoId ? { ...p, estado_id: 2 } : p))
      );

      toast.success("Producto inactivado correctamente");
    } catch (err) {
      console.error("Error al inactivar producto:", err);
      toast.error("Error al inactivar producto");
    }
  };

  return (
    <CarritoContext.Provider
      value={{
        productos,
        productosFiltrados,
        categorias,
        categoriaSeleccionada,
        setCategoriaSeleccionada,
        carrito,
        carritoVisible,
        setCarritoVisible,
        agregarAlCarrito,
        eliminarDelCarrito,
        finalizarCompra,
        loading,
        error,
        estados,
        inactivarProducto,
        obtenerProductosPaginados, // 🔄 nueva función de paginación
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};