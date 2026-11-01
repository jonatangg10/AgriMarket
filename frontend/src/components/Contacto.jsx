import { useState } from "react";
import toast from "react-hot-toast";

function Contact() {
  const [formulario, setFormulario] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    mensaje: "",
    acepta_politicas: false,
  });

  // Actualizar campos
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormulario({
      ...formulario,
      [name]: type === "checkbox" ? checked : value,
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
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formulario),
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
        acepta_politicas: false,
      });
    } catch (error) {
      console.error("Error enviando contacto:", error);
      toast.error("No se pudo enviar el mensaje.");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#C9D6C0] bg-white px-4 py-3 text-[#17261D] placeholder:text-gray-400 transition-all focus:border-[#14432F] focus:outline-none focus:ring-2 focus:ring-[#CFE7D6]";

  const labelClass =
    "mb-2 block text-xs font-bold uppercase tracking-wide text-[#17261D]";

  return (
    <section id="contacto" className="w-full pt-8 pb-10">
      <div className="container mx-auto px-4">
        <div className="overflow-hidden rounded-2xl border border-[#E1E8DA] bg-white shadow-sm">
          <div className="grid grid-cols-1 items-stretch lg:grid-cols-2">
            {/* FORMULARIO */}
            <div className="flex flex-col justify-center p-8 lg:p-12">
              <div className="mb-8">
                <h2 className="mb-3 text-center text-3xl font-extrabold tracking-tight text-[#14432F]">
                  AgrilMarket
                </h2>

                <p className="text-center leading-relaxed text-[#4F6355]">
                  Completa el siguiente formulario y uno de nuestros asesores
                  se pondrá en contacto contigo lo antes posible. Estaremos
                  encantados de atenderte.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="nombres" className={labelClass}>
                      Nombres
                    </label>
                    <input
                      id="nombres"
                      type="text"
                      name="nombres"
                      value={formulario.nombres}
                      onChange={handleChange}
                      placeholder="Nombres"
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="apellidos" className={labelClass}>
                      Apellidos
                    </label>
                    <input
                      id="apellidos"
                      type="text"
                      name="apellidos"
                      value={formulario.apellidos}
                      onChange={handleChange}
                      placeholder="Apellidos"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="correo" className={labelClass}>
                    Correo electrónico
                  </label>
                  <input
                    id="correo"
                    type="email"
                    name="correo"
                    value={formulario.correo}
                    onChange={handleChange}
                    placeholder="Correo electrónico"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="mensaje" className={labelClass}>
                    Mensaje
                  </label>
                  <textarea
                    id="mensaje"
                    rows="5"
                    name="mensaje"
                    value={formulario.mensaje}
                    onChange={handleChange}
                    placeholder="Ingresa tu mensaje"
                    className={`${inputClass} resize-none`}
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
                    className="mt-1 h-4 w-4 rounded border-[#C9D6C0] accent-[#14432F]"
                    required
                  />
                  <label
                    htmlFor="privacy"
                    className="ml-3 text-sm text-[#4F6355]"
                  >
                    He leído y acepto las políticas de privacidad
                  </label>
                </div>

                <button
                  type="submit"
                  className="min-h-11 w-full rounded-xl bg-[#14432F] py-3 font-bold text-white shadow-sm transition-colors hover:bg-[#0E3323]"
                >
                  Enviar mensaje
                </button>
              </form>
            </div>

            {/* MAPA */}
            <div className="h-full min-h-[400px] lg:min-h-[600px]">
              <iframe
                title="Ubicación de AgrilMarket en Villeta, Cundinamarca"
                className="h-full w-full"
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