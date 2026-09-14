import { useState, useContext } from "react";
import { CarritoContext } from "../context/CarritoContext"; // Asegúrate de ajustar la ruta de importación
import { toast } from "react-hot-toast";

const FormComprar = () => {

  const { carrito, setCarrito, setComprarVisible } = useContext(CarritoContext);
  const [submitting, setSubmitting] = useState(false);
  const totalCarrito = carrito.reduce(
    (acc, prod) => acc + Number(prod.precio) * Number(prod.cantidad),
    0
  );

  const [user, setuser] = useState({
    identification_document_code: "13",
    identification: "",
    company: "",
    trade_name: "",
    address: "",
    email: "",
    phone: "",
    legal_organization_code: "2",
    tribute_code: "ZZ",
    country_code: "CO",
    responsibilities: ["R-99-PN"],
    municipality_code: "68679",
  });
  const [payment, setPayment] = useState({
    payment_form: "1",
    payment_method_code: "10",
    observation: "",
  });

  const handleChangeUser = (e) => {
    setuser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };
  const handleChangePayment = (e) => {
    setPayment({
      ...payment,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (carrito.length === 0) {
      toast.error("El carrito está vacío.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        customer: {
          ...user,
          trade_name: user.trade_name || user.company,
        },
        items: carrito.map((prod) => ({
          id: prod.id,
          nombre: prod.nombre,
          precio: prod.precio,
          cantidad: prod.cantidad,
        })),
        payment_details: payment,


      };

      // ---llamar el endpoint no oficial-----------------------
      const response = await fetch(
        "https://agrimarket-yfbo.onrender.com/api/facturas/finalizar-compra",
        "http://localhost:3000/api/facturas/finalizar-compra",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al procesar la compra");
      }
      toast.success("¡Factura emitida y compra procesada con éxito!");
      console.log("SERVIDOR RESPONDE:");
      console.log(data);
      // ---------------------------------------------------------------------------

      setCarrito([]);
      setComprarVisible(false);
      // console.log("FACTURA GENERADA:");
      // console.log(payload);

    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };


  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100";

  const labelClass =
    "mb-1.5 block text-sm font-medium text-gray-700";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">

      <div className="mx-auto max-w-4xl">

        {/* Encabezado */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Datos de facturación
          </h1>

          <p className="mt-2 text-gray-500">
            Ingresa los datos necesarios para generar tu factura y revisa verifica tus productos.
          </p>
        </div>

        {/* resumen carro*/}
        <div className="mb-8 overflow-hidden rounded-2xl bg-white p-6 shadow-lg sm:p-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Resumen del pedido
          </h2>

          {carrito.length === 0 ? (
            <p className="text-sm text-gray-500">No hay productos en el carrito.</p>
          ) : (
            <div className="divide-y divide-gray-200">
              {carrito.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    {item.imagen && (
                      <img
                        src={item.imagen}
                        alt={item.nombre}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{item.nombre}</p>
                      <p className="text-xs text-gray-500">
                        Cantidad: {item.cantidad} x ${Number(item.precio).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-800">
                    ${(Number(item.precio) * Number(item.cantidad)).toLocaleString()}
                  </span>
                </div>
              ))}

              <div className="flex justify-between pt-4 text-lg font-bold text-gray-900">
                <span>Total a Pagar:</span>
                <span className="text-green-600">${totalCarrito.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl bg-white shadow-lg"
        >

          {/* Información del cliente */}
          <div className="border-b border-gray-200 p-6 sm:p-8">

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Información del cliente
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Datos de identificación y contacto.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* Tipo de documento */}
              <div>
                <label
                  htmlFor="identification_document_code"
                  className={labelClass}
                >
                  Tipo de documento
                </label>

                <select
                  id="identification_document_code"
                  name="identification_document_code"
                  value={user.identification_document_code}
                  onChange={handleChangeUser}
                  className={inputClass}
                >
                  <option value="13">
                    Cédula de ciudadanía
                  </option>

                  <option value="31">
                    NIT
                  </option>

                  <option value="21">
                    Tarjeta de extranjería
                  </option>

                  <option value="22">
                    Cédula de extranjería
                  </option>

                  <option value="41">
                    Pasaporte
                  </option>
                </select>
              </div>

              {/* Identificación */}
              <div>
                <label
                  htmlFor="identification"
                  className={labelClass}
                >
                  Número de identificación
                </label>

                <input
                  id="identification"
                  type="text"
                  name="identification"
                  value={user.identification}
                  onChange={handleChangeUser}
                  placeholder="Ej. 123456789"
                  className={inputClass}
                  required
                />
              </div>

              {/* Nombre */}
              <div>
                <label
                  htmlFor="company"
                  className={labelClass}
                >
                  Nombre / Razón social
                </label>

                <input
                  id="company"
                  type="text"
                  name="company"
                  value={user.company}
                  onChange={handleChangeUser}
                  placeholder="Nombre completo"
                  className={inputClass}
                  required
                />
              </div>

              {/* Nombre comercial */}
              <div>
                <label
                  htmlFor="trade_name"
                  className={labelClass}
                >
                  Nombre comercial
                  <span className="ml-1 text-xs font-normal text-gray-400">
                    (opcional)
                  </span>
                </label>

                <input
                  id="trade_name"
                  type="text"
                  name="trade_name"
                  value={user.trade_name}
                  onChange={handleChangeUser}
                  placeholder="Nombre del negocio"
                  className={inputClass}
                />
              </div>

              {/* Dirección */}
              <div className="md:col-span-2">
                <label
                  htmlFor="address"
                  className={labelClass}
                >
                  Dirección
                </label>

                <input
                  id="address"
                  type="text"
                  name="address"
                  value={user.address}
                  onChange={handleChangeUser}
                  placeholder="Ej. Calle 1 # 1-23"
                  className={inputClass}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className={labelClass}
                >
                  Correo electrónico
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleChangeUser}
                  placeholder="correo@ejemplo.com"
                  className={inputClass}
                  required
                />
              </div>

              {/* Teléfono */}
              <div>
                <label
                  htmlFor="phone"
                  className={labelClass}
                >
                  Teléfono
                </label>

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={user.phone}
                  onChange={handleChangeUser}
                  placeholder="Ej. 3001234567"
                  className={inputClass}
                  required
                />
              </div>

              {/* Tipo de organización */}
              <div>
                <label
                  htmlFor="legal_organization_code"
                  className={labelClass}
                >
                  Tipo de organización
                </label>

                <select
                  id="legal_organization_code"
                  name="legal_organization_code"
                  value={user.legal_organization_code}
                  onChange={handleChangeUser}
                  className={inputClass}
                >
                  <option value="1">
                    Persona jurídica
                  </option>

                  <option value="2">
                    Persona natural
                  </option>
                </select>
              </div>

              {/* Responsabilidad tributaria */}
              <div>
                <label
                  htmlFor="tribute_code"
                  className={labelClass}
                >
                  Responsabilidad tributaria
                </label>

                <select
                  id="tribute_code"
                  name="tribute_code"
                  value={user.tribute_code}
                  onChange={handleChangeUser}
                  className={inputClass}
                >
                  <option value="ZZ">
                    No aplica
                  </option>
                </select>
              </div>

              {/* Municipio */}
              <div>
                <label
                  htmlFor="municipality_code"
                  className={labelClass}
                >
                  Código de municipio
                </label>

                <input
                  id="municipality_code"
                  type="text"
                  name="municipality_code"
                  value={user.municipality_code}
                  onChange={handleChangeUser}
                  placeholder="Ej. 68679"
                  className={inputClass}
                  required
                />
              </div>

            </div>
          </div>

          {/* Información de pago */}
          <div className="border-b border-gray-200 bg-gray-50 p-6 sm:p-8">

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Información de pago
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Selecciona cómo se realizará el pago.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* Forma de pago */}
              <div>
                <label
                  htmlFor="payment_form"
                  className={labelClass}
                >
                  Forma de pago
                </label>

                <select
                  id="payment_form"
                  name="payment_form"
                  value={payment.payment_form}
                  onChange={handleChangePayment}
                  className={inputClass}
                >
                  <option value="1">
                    Contado
                  </option>

                  <option value="2">
                    Crédito
                  </option>
                </select>
              </div>

              {/* Medio de pago */}
              <div>
                <label
                  htmlFor="payment_method_code"
                  className={labelClass}
                >
                  Medio de pago
                </label>

                <select
                  id="payment_method_code"
                  name="payment_method_code"
                  value={payment.payment_method_code}
                  onChange={handleChangePayment}
                  className={inputClass}
                >
                  <option value="10">
                    Efectivo
                  </option>

                  <option value="42">
                    Consignación bancaria
                  </option>

                  <option value="48">
                    Tarjeta de crédito
                  </option>

                  <option value="49">
                    Tarjeta débito
                  </option>
                </select>
              </div>

              {/* Observación */}
              <div className="md:col-span-2">
                <label
                  htmlFor="observation"
                  className={labelClass}
                >
                  Observación
                  <span className="ml-1 text-xs font-normal text-gray-400">
                    (opcional)
                  </span>
                </label>

                <textarea
                  id="observation"
                  name="observation"
                  value={payment.observation}
                  onChange={handleChangePayment}
                  rows="3"
                  placeholder="Agrega alguna observación..."
                  className={inputClass}
                />
              </div>

            </div>
          </div>

          {/* Botón */}
          <div className="flex justify-end bg-white p-6 sm:p-8">

            <button
              type="submit"
              className="w-full rounded-lg bg-green-600 px-8 py-3 font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto"
            >
              Generar factura
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}
export default FormComprar;
