import { createContext, useState } from "react";
import { toast } from "react-hot-toast";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [loadingUsers, setLoadingUsers] = useState(false);

  const obtenerUsuariosPaginados = async ({ page, pageSize, search = "" }) => {
    try {
      setLoadingUsers(true);
      const response = await fetch(
        `https://agrimarket-yfbo.onrender.com/api/usuarios/paginados?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`
      );

      if (!response.ok) throw new Error("Error al obtener usuarios");

      const data = await response.json();
      return {
        usuarios: data.usuarios,
        total: data.total
      };
    } catch (err) {
      console.error("Error UserContext:", err);
      toast.error("No se pudieron cargar los usuarios");
      return { usuarios: [], total: 0 };
    } finally {
      setLoadingUsers(false);
    }
  };

const obtenerUsuariosPorRol = async (rolId) => {
    try {
      const response = await fetch(`https://agrimarket-yfbo.onrender.com/api/usuarios`);
      
      if (!response.ok) throw new Error("Error al obtener todos los usuarios");
      
      const data = await response.json();
      
      // Filtramos la lista completa para que solo devuelva los del rol solicitado 
      // Aseguramos que data sea un array antes de filtrar
      const usuariosFiltrados = Array.isArray(data) 
        ? data.filter(usuario => usuario.rol_id === rolId)
        : data.usuarios?.filter(usuario => usuario.rol_id === rolId) || [];

      return usuariosFiltrados;
    } catch (err) {
      console.error("Error al obtener usuarios por rol:", err);
      toast.error("No se pudieron cargar los vendedores");
      return [];
    }
  };


  const eliminarUsuario = async (id) => {
    try {
      const response = await fetch(`https://agrimarket-yfbo.onrender.com/api/usuarios/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || "Error al eliminar");
      
      toast.success("Usuario eliminado correctamente");
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  };

  // --- Nueva función para guardar (Crear o Editar) ---
const guardarUsuario = async (usuario) => {
    try {
      const url = usuario.id 
        ? `https://agrimarket-yfbo.onrender.com/api/usuarios/${usuario.id}` 
        : `https://agrimarket-yfbo.onrender.com/api/usuarios`;
      // const url = usuario.id 
      //   ? `http://localhost:3000/api/usuarios/${usuario.id}` 
      //   : `http://localhost:3000/api/usuarios`;
      
      const method = usuario.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar la solicitud");
      }

      toast.success(usuario.id ? "Usuario actualizado correctamente" : "Usuario creado correctamente");
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  };

  return (
    <UserContext.Provider value={{ 
      obtenerUsuariosPaginados, 
      eliminarUsuario, 
      guardarUsuario, // Agregada
      obtenerUsuariosPorRol, // Agregada
      loadingUsers 
    }}>
      {children}
    </UserContext.Provider>
  );
};