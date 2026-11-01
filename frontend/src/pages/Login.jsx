import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../context/AuthContext"; // Importar contexto
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Toaster } from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // ⬅️ Función para guardar usuario globalmente

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("https://agrimarket-yfbo.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      // 👉 Guardar usuario en el AuthContext
      login(data.usuario);

      navigate("/admin");
    } catch (error) {
      setError("Error de conexión con el servidor");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <Toaster position="bottom-right" />
      <main className="flex flex-grow items-center justify-center px-4 pt-[120px] pb-0">
        <div className="bg-white flex flex-col md:flex-row rounded-3xl shadow-xl overflow-hidden max-w-4xl w-full">

        {/* Formulario */}
        <div className="w-full md:w-1/2 p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-[#14432F]">Iniciar Sesión</h2>
          <p className="text-gray-500 text-sm mb-6">
            Si ya tienes una cuenta, inicia sesión
          </p>

          {error && (
            <div className="text-red-500 text-sm mb-3 text-center">{error}</div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="Ingresa tu correo electrónico"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                className="w-full p-3 mt-1 bg-gray-100 rounded-lg outline-none focus:ring focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 mt-1 bg-gray-100 rounded-lg outline-none focus:ring focus:ring-blue-300"
              />
            </div>

            <div className="text-right">
              <button type="button" className="text-sm text-[#14432F] hover:underline">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button className="w-full bg-[#14432F] hover:bg-[#0E3323] text-white font-semibold py-3 rounded-lg transition">
              Ingresar
            </button>
          </form>

          <div className="flex items-center gap-4 my-5">
            <span className="flex-1 h-px bg-gray-300"></span>
            <span className="text-xs text-gray-500">O</span>
            <span className="flex-1 h-px bg-gray-300"></span>
          </div>

          <button
            type="button"
            className="w-full border border-gray-300 rounded-lg py-3 flex items-center justify-center gap-2 hover:bg-gray-50 transition"
          >
            <FcGoogle className="text-xl" />
            Iniciar sesión con Google
          </button>

          <p className="text-sm text-[#14432F] text-center mt-6">
            ¿No tienes una cuenta?
          </p>
          <button
            onClick={() => navigate("/register")}
            className="mt-2 border border-[#14432F] text-[#14432F] w-full py-2 rounded-lg hover:bg-[#14432F] hover:text-white transition"
          >
            Registrarse
          </button>
        </div>

        <div className="hidden md:flex w-1/2">
          <img
            src="fondos/Aguacate-Antioquia.png"
            alt="Imagen de inicio de sesión"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
      </main>
      <Footer />
    </div>
    
  );
};

export default Login;