import { createContext, useState } from "react";
import { toast } from "react-hot-toast";

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [loadingProducts, setLoadingProducts] = useState(false);

    // Categorías de ejemplo para el filtro, luego puedes hacerlas dinámicas
    const categorias = ["Frutas", "Hortalizas", "Tubérculos"];

    const obtenerProductosPaginados = async ({ page, pageSize, search = "", categoria = "", usuario_id = "" }) => {
        try {
            setLoadingProducts(true);
            const queryParams = new URLSearchParams({
                page,
                pageSize,
                search,
                categoria,
                usuario_id
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

            // 1. Creamos el "formulario virtual" vacío
            const formData = new FormData();

            // 2. Agregamos los campos de texto manualmente, uno por uno
            formData.append('nombre', producto.nombre);
            formData.append('categoria', producto.categoria);
            formData.append('precio', producto.precio);
            formData.append('stock', producto.stock);
            formData.append('etiqueta', producto.etiqueta);
            formData.append('estado_id', producto.estado_id);
            formData.append('usuario_id', producto.usuario_id);
            formData.append('municipio_code', producto.municipio_code);

            // 3. Agregamos la imagen SOLO si el usuario seleccionó una
            if (producto.imagen) {
                formData.append('imagen', producto.imagen);
            }

            // Opcional: Si estamos editando y hay una imagen vieja, la mandamos por si acaso
            if (producto.imagenExistente) {
                formData.append('imagenExistente', producto.imagenExistente);
            }

            // 4. Enviamos el formulario al servidor
            const response = await fetch(url, {
                method: method,
                body: formData, // Envíamos la "caja" con los datos y el archivo
                // Nota: NO ponemos headers de "Content-Type", el navegador lo hace automático para FormData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Error al procesar la solicitud");
            }

            toast.success(producto.id ? "Producto actualizado" : "Producto creado");
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