import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Toaster, toast } from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";

const API = "https://agrimarket-yfbo.onrender.com/api";

const formularioInicial = {
  nombres: "",
  apellidos: "",
  num_documento: "",
  correo: "",
  genero_id: "",
  rol_id: "2",
  password: "",
  confirmarPassword: "",
};

const inputClase =
  "w-full p-3 mt-1 bg-gray-100 rounded-lg outline-none focus:ring focus:ring-blue-300";
const labelClase = "block text-sm font-medium text-gray-700";

const Registrarse = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState(formularioInicial);
  const [errores, setErrores] = useState({});
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [verPassword, setVerPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Limpia el error del campo al escribir
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: "" }));
  };

  const validar = () => {
    const e = {};
    if (!form.nombres.trim()) e.nombres = "Ingresa tus nombres";
    if (!form.apellidos.trim()) e.apellidos = "Ingresa tus apellidos";

    if (!form.num_documento.trim()) {
      e.num_documento = "Ingresa tu número de documento";
    } else if (!/^\d{6,12}$/.test(form.num_documento.trim())) {
      e.num_documento = "Debe tener entre 6 y 12 dígitos";
    }

    if (!form.correo.trim()) {
      e.correo = "Ingresa tu correo";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) {
      e.correo = "Correo no válido";
    }

    if (!form.genero_id) e.genero_id = "Selecciona una opción";

    if (form.password.length < 6) {
      e.password = "Mínimo 6 caracteres";
    }
    if (form.confirmarPassword !== form.password) {
      e.confirmarPassword = "Las contraseñas no coinciden";
    }

    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validar()) return;

    setEnviando(true);
    try {
      // 1. Crear la cuenta
      const res = await fetch(`${API}/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombres: form.nombres.trim(),
          apellidos: form.apellidos.trim(),
          num_documento: form.num_documento.trim(),
          correo: form.correo.trim().toLowerCase(),
          password: form.password,
          genero_id: Number(form.genero_id),
          rol_id: Number(form.rol_id),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo crear la cuenta");
        return;
      }

      toast.success("¡Cuenta creada con éxito!");

      // 2. Iniciar sesión automáticamente con la cuenta nueva
      const resLogin = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: form.correo.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const dataLogin = await resLogin.json();
      if (!resLogin.ok) {
        // La cuenta existe pero el login falló: lo mandamos al login
        navigate("/login");
        return;
      }

      login(dataLogin.usuario);
      navigate(dataLogin.usuario.rol === 3 ? "/productor-solicitudes" : "/admin");
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setEnviando(false);
    }
  };

  const ErrorCampo = ({ campo }) =>
    errores[campo] ? (
      <p className="text-red-500 text-xs mt-1">{errores[campo]}</p>
    ) : null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <Toaster position="bottom-right" />
      <main className="flex flex-grow items-center justify-center px-4 pt-[120px] pb-10">
        <div className="bg-white flex flex-col md:flex-row rounded-3xl shadow-xl overflow-hidden max-w-5xl w-full">
          {/* Formulario */}
          <div className="w-full md:w-3/5 p-8 sm:p-10">
            <h2 className="text-2xl font-bold text-[#14432F]">Registrarse</h2>
            <p className="text-gray-500 text-sm mb-6">
              Crea tu cuenta para comprar o vender en AgriMarket
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4 text-center">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              {/* Tipo de cuenta */}
              <div>
                <span className={labelClase}>Tipo de cuenta</span>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  {[
                    { valor: "2", titulo: "Comprador", texto: "Quiero comprar productos" },
                    { valor: "3", titulo: "Agricultor", texto: "Quiero vender mis productos" },
                  ].map((op) => (
                    <label
                      key={op.valor}
                      className={`cursor-pointer rounded-lg border p-3 transition ${
                        form.rol_id === op.valor
                          ? "border-[#14432F] bg-[#14432F]/5 ring-1 ring-[#14432F]"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="rol_id"
                        value={op.valor}
                        checked={form.rol_id === op.valor}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className="block text-sm font-semibold text-[#14432F]">
                        {op.titulo}
                      </span>
                      <span className="block text-xs text-gray-500">{op.texto}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClase} htmlFor="nombres">Nombres</label>
                  <input
                    id="nombres"
                    name="nombres"
                    type="text"
                    placeholder="Tus nombres"
                    value={form.nombres}
                    onChange={handleChange}
                    className={inputClase}
                  />
                  <ErrorCampo campo="nombres" />
                </div>

                <div>
                  <label className={labelClase} htmlFor="apellidos">Apellidos</label>
                  <input
                    id="apellidos"
                    name="apellidos"
                    type="text"
                    placeholder="Tus apellidos"
                    value={form.apellidos}
                    onChange={handleChange}
                    className={inputClase}
                  />
                  <ErrorCampo campo="apellidos" />
                </div>

                <div>
                  <label className={labelClase} htmlFor="num_documento">Número de documento</label>
                  <input
                    id="num_documento"
                    name="num_documento"
                    type="text"
                    inputMode="numeric"
                    placeholder="Ej: 1003510994"
                    value={form.num_documento}
                    onChange={(e) =>
                      handleChange({
                        target: { name: "num_documento", value: e.target.value.replace(/\D/g, "") },
                      })
                    }
                    className={inputClase}
                  />
                  <ErrorCampo campo="num_documento" />
                </div>

                <div>
                  <label className={labelClase} htmlFor="genero_id">Género</label>
                  <select
                    id="genero_id"
                    name="genero_id"
                    value={form.genero_id}
                    onChange={handleChange}
                    className={inputClase}
                  >
                    <option value="">Selecciona...</option>
                    <option value="1">Hombre</option>
                    <option value="2">Mujer</option>
                  </select>
                  <ErrorCampo campo="genero_id" />
                </div>
              </div>

              <div>
                <label className={labelClase} htmlFor="correo">Correo Electrónico</label>
                <input
                  id="correo"
                  name="correo"
                  type="email"
                  placeholder="Ingresa tu correo electrónico"
                  value={form.correo}
                  onChange={handleChange}
                  className={inputClase}
                />
                <ErrorCampo campo="correo" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClase} htmlFor="password">Contraseña</label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={verPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={form.password}
                      onChange={handleChange}
                      className={`${inputClase} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setVerPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-gray-500 hover:text-[#14432F]"
                      title={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {verPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  <ErrorCampo campo="password" />
                </div>

                <div>
                  <label className={labelClase} htmlFor="confirmarPassword">Confirmar contraseña</label>
                  <input
                    id="confirmarPassword"
                    name="confirmarPassword"
                    type={verPassword ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    value={form.confirmarPassword}
                    onChange={handleChange}
                    className={inputClase}
                  />
                  <ErrorCampo campo="confirmarPassword" />
                </div>
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-[#14432F] hover:bg-[#0E3323] text-white font-semibold py-3 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {enviando ? "Creando cuenta..." : "Crear cuenta"}
              </button>
            </form>

            <p className="text-sm text-gray-600 text-center mt-6">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/login" className="text-[#14432F] font-semibold hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>

          <div className="hidden md:flex md:w-2/5">
            <img
              src="/fondos/Cafe-Huila.png"
              alt="Cultivo de café en el Huila"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Registrarse;
