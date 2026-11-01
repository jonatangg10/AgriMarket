import { Routes, Route, Navigate } from "react-router-dom";
import App from "../App";
import DetalleProducto from "../components/DetalleProducto";
import Dashboard from "../pages/Dashboard";
import Admin from "../pages/Admin";
import AdminUsers from "../pages/AdminUsers";
import Login from "../pages/Login";
import Registrarse from "../pages/Registrarse";
import ContactoPage from "../pages/Contact";
import PrivateRoute from "./PrivateRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/producto/:id" element={<DetalleProducto />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registrarse" element={<Registrarse />} />
      <Route path="/contacto" element={<ContactoPage  />} />

      {/* Rutas Protegidas (Solo Admin) */}
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin-productos"
        element={
          <PrivateRoute>
            <Admin />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin-users"
        element={
          <PrivateRoute>
            <AdminUsers />
          </PrivateRoute>
        }
      />

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
