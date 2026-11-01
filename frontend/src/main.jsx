import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import "./index.css";
import { CarritoProvider } from "./context/CarritoContext";
import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext"; // 1. Importamos el nuevo provider
import { ProductProvider } from "./context/ProductContext"; // Importamos el ProductProvider
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <UserProvider> {/* 2. Envolvemos aquí */}
        <CarritoProvider>
          <ProductProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
          </ProductProvider>
        </CarritoProvider>
      </UserProvider>
    </AuthProvider>
  </React.StrictMode>
);