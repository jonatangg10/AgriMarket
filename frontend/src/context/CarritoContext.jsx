import { createContext, useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";

export const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  const [productos, setProductos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [carritoVisible, setCarritoVisible] = useState(false);
  const [comprarVisible, setComprarVisible] = useState(false);
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
  const obtenerProductosPaginados = async ({ page, pageSize, search = "", categoria = "" }) => {
    try {
      const response = await fetch(
        `https://agrimarket-yfbo.onrender.com/api/productos/paginados?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}&categoria=${encodeURIComponent(categoria)}`
      );

      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const data = await response.json();

      if (!data.productos || !data.total) throw new Error("Formato de respuesta inválido");

      return { productos: data.productos, total: data.total };
    } catch (err) {
      console.error("Error al obtener productos paginados:", err.message);
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

  // 🛒 Agregar producto al carrito (solo estado local)
  const agregarAlCarrito = (producto) => {
    const productoEnTienda = productos.find((p) => p.id === producto.id);
    if (!productoEnTienda || productoEnTienda.stock < 1) {
      toast.error("Producto agotado");
      return;
    }

    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      return existe
        ? prev.map((item) =>
            item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
          )
        : [...prev, { ...producto, cantidad: 1 }];
    });


    toast.success("Producto agregado al carrito");
  };

  // ❌ Eliminar producto del carrito (solo estado local)
  const eliminarDelCarrito = (productoId, eliminarTodo = false) => {
    const productoEnCarrito = carrito.find((item) => item.id === productoId);
    if (!productoEnCarrito) return;

    const cantidadARestaurar = eliminarTodo ? productoEnCarrito.cantidad : 1;

    setCarrito((prev) =>
      eliminarTodo
        ? prev.filter((item) => item.id !== productoId)
        : prev
            .map((item) =>
              item.id === productoId ? { ...item, cantidad: item.cantidad - 1 } : item
            )
            .filter((item) => item.cantidad > 0)
    );
    return(cantidadARestaurar)

  };

  // ✅ Finalizar compra (ahí sí actualizas BD)
  const finalizarCompra = async () => {
    try {
      // borré el for que usted puso porque el stock no lo manejo en endpoint desde front sino interno en back en el mismo endpoint que llama a factus
      setCarritoVisible(false); //anteriormente se le vaciaba carrito porque usted lo ReadableStreamBYOBReader, solo se oculta hasta que se somplete la compra
      setComprarVisible(true);
      // toast.success("¡Gracias por tu compra!");esto no porque solo se esta abriendo el form de cmpra ,aun no se formaliza
    } catch (err) {
      toast.error("Error al procesar la compra");//no creo que esto alguna vez llegue a ejecutarse por la simplicidad del try pero bueno ahi lo dejo
    }
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

      if (!response.ok) throw new Error("Error al inactivar producto");

      setProductos((prev) =>
        prev.map((p) => (p.id === productoId ? { ...p, estado_id: 2 } : p))
      );

      toast.success("Producto inactivado correctamente");
    } catch (err) {
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
        setCarrito,
        carritoVisible,
        setCarritoVisible,
        agregarAlCarrito,
        eliminarDelCarrito,
        finalizarCompra,
        loading,
        error,
        estados,
        inactivarProducto,
        obtenerProductosPaginados,
        comprarVisible,
        setComprarVisible,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};
