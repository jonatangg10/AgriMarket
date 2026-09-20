import { useState } from "react";
import toast from "react-hot-toast";

function Contact() {

  const [formulario, setFormulario] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    mensaje: "",
    acepta_politicas: false
  });

  // Actualizar campos
  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    setFormulario({
      ...formulario,
      [name]: type === "checkbox" ? checked : value
    });

  };

  // Enviar formulario
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const respuesta = await fetch(
        "https://agrimarket-yfbo.onrender.com/api/contacto",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formulario)
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {

        toast.error(datos.mensaje);

        return;
      }

      toast.success(datos.mensaje);

      // Limpiar formulario
      setFormulario({
        nombres: "",
        apellidos: "",
        correo: "",
        mensaje: "",
        acepta_politicas: false
      });

    } catch (error) {

      console.error("Error enviando contacto:", error);

      toast.error("No se pudo enviar el mensaje.");

    }

  };

  return (
    <section id="contacto" className="w-full pt-8 pb-10">

      <div className="container mx-auto px-4">

        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">

          <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch">

            {/* FORMULARIO */}

            <div className="p-8 lg:p-12 flex flex-col justify-center">

              <div className="mb-8">

                <h2 className="text-3xl font-bold text-gray-800 text-center mb-3">
                  🚜 AgrilMarket
                </h2>

                <p className="text-gray-600 text-center leading-relaxed">
                  Completa el siguiente formulario y uno de nuestros asesores
                  se pondrá en contacto contigo lo antes posible. Estaremos
                  encantados de atenderte.
                </p>

              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div>

                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      NOMBRES
                    </label>

                    <input
                      type="text"
                      name="nombres"
                      value={formulario.nombres}
                      onChange={handleChange}
                      placeholder="Nombres"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                      required
                    />

                  </div>

                  <div>

                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      APELLIDOS
                    </label>

                    <input
                      type="text"
                      name="apellidos"
                      value={formulario.apellidos}
                      onChange={handleChange}
                      placeholder="Apellidos"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                      required
                    />

                  </div>

                </div>

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CORREO ELECTRÓNICO
                  </label>

                  <input
                    type="email"
                    name="correo"
                    value={formulario.correo}
                    onChange={handleChange}
                    placeholder="Correo electrónico"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                    required
                  />

                </div>

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    MENSAJE
                  </label>

                  <textarea
                    rows="5"
                    name="mensaje"
                    value={formulario.mensaje}
                    onChange={handleChange}
                    placeholder="Ingresa tu mensaje"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                    required
                  />

                </div>

                <div className="flex items-start">

                  <input
                    type="checkbox"
                    id="privacy"
                    name="acepta_politicas"
                    checked={formulario.acepta_politicas}
                    onChange={handleChange}
                    className="h-4 w-4 mt-1 text-blue-600 border-gray-300 rounded"
                    required
                  />

                  <label
                    htmlFor="privacy"
                    className="ml-3 text-sm text-gray-600"
                  >
                    He leído y acepto las políticas de privacidad
                  </label>

                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-sm transition-all"
                >
                  Enviar mensaje
                </button>

              </form>

            </div>

            {/* MAPA */}

            <div className="h-full min-h-[600px]">

              <iframe
                className="w-full h-full"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127303.4912234057!2d-74.45781615!3d5.0166667!2m3!1f0!2f768!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e40f90e9d0d3885%3A0x6b6f3a3a71b12271!2sVilleta%2C%20Cundinamarca%2C%20Colombia!5e0!3m2!1sen!2sus!4v1714156789000!5m2!1sen!2sus"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Contact;