import { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

// Lee la sesión guardada de forma síncrona para que esté disponible
// desde el primer render (evita que PrivateRoute redirija a /login al refrescar).
const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("usuario");
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      return JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Error al parsear usuario:", error);
  }
  localStorage.removeItem("usuario");
  return null;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(getStoredUser);
  const [isAuthenticated, setIsAuthenticated] = useState(() => usuario !== null);

  const login = (userData) => {
    setUsuario(userData);
    setIsAuthenticated(true);
    localStorage.setItem("usuario", JSON.stringify(userData));
  };

  const logout = () => {
    setUsuario(null);
    setIsAuthenticated(false);
    localStorage.removeItem("usuario");
  };

  return (
    <AuthContext.Provider value={{ usuario, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);