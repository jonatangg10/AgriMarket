import { useContext } from "react";
import { toast } from "react-hot-toast";
import {
  MinusIcon,
  PlusIcon,
  TrashIcon,
  TruckIcon,
  ShoppingCartIcon,
  ShieldCheckIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { CarritoContext } from "../context/CarritoContext";
import { precioAntes, formatoPrecio } from "../utils/ofertas";

const obtenerUrlImagen = (ruta) => {
  if (!ruta) return "/images/placeholder.jpg";
  if (ruta.startsWith("/uploads/")) return `https://agrimarket-yfbo.onrender.com${ruta}`;
  return ruta;
};

/**
 * Contenido del carrito.
 * Agregar / Eliminar son opcionales: en el inicio se pasan para actualizar el stock
 * de la grilla; en las demás páginas se usan directamente las funciones del contexto.
 */
const Carrito = ({ Eliminar, Agregar }) => {
  const { carrito, finalizarCompra, agregarAlCarrito, eliminarDelCarrito, setCarritoVisible } =
    useContext(CarritoContext);

  const agregar = Agregar || agregarAlCarrito;
  const eliminar = Eliminar || eliminarDelCarrito;

  const unidades = carrito.reduce((s, item) => s + item.cantidad, 0);
  const total = carrito.reduce((s, item) => s + item.precio * item.cantidad, 0);
  const ahorro = carrito.reduce((s, item) => {
    const antes = precioAntes(item);
    return antes ? s + (antes - item.precio) * item.cantidad : s;
  }, 0);

  const cerrar = () => setCarritoVisible(false);

  if (carrito.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E3F1E7] text-[#14432F]">
          <ShoppingCartIcon className="h-8 w-8" />
        </span>
        <p className="text-lg font-bold text-[#17261D]">Tu carrito está vacío</p>
        <p className="mt-1 max-w-xs text-sm text-[#4F6355]">
          Agrega frutas, hortalizas y más productos frescos directo de los productores.
        </p>
        <button
          type="button"
          onClick={cerrar}
          className="mt-6 min-h-11 rounded-xl bg-[#14432F] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0E3323]"
        >
          Explorar productos
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="-mt-2 text-sm text-[#4F6355]">
        {unidades} {unidades === 1 ? "unidad" : "unidades"} · {carrito.length}{" "}
        {carrito.length === 1 ? "producto" : "productos"}
      </p>

      {/* Productos */}
      <ul className="flex flex-col gap-3">
        {carrito.map((item) => {
          const antes = precioAntes(item);
          const sinMasStock = item.stock !== undefined && item.cantidad >= item.stock;
          const vendedor = [item.vendedor_nombres?.split(" ")[0], item.vendedor_apellidos?.split(" ")[0]]
            .filter(Boolean)
            .join(" ");

          return (
            <li key={item.id} className="flex gap-4 rounded-2xl border border-[#E1E8DA] bg-white p-3 sm:p-4">
              <img
                src={obtenerUrlImagen(item.imagen)}
                alt={item.nombre}
                className="h-20 w-20 shrink-0 rounded-xl bg-[#DCE6D3] object-cover sm:h-24 sm:w-24"
              />

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 font-bold leading-tight text-[#17261D]">{item.nombre}</h3>
                    {(vendedor || item.municipio_nombre) && (
                      <p className="truncate text-xs text-[#4F6355]">
                        {vendedor && `Vendido por ${vendedor}`}
                        {vendedor && item.municipio_nombre && " · "}
                        {item.municipio_nombre}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => eliminar(item.id, true)}
                    aria-label={`Quitar ${item.nombre} del carrito`}
                    title="Quitar del carrito"
                    className="-mr-1 -mt-1 shrink-0 rounded-lg p-1.5 text-[#4F6355] transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>

                <p className="mt-1 text-sm text-[#4F6355]">
                  {antes && <span className="mr-1.5 line-through">{formatoPrecio(antes)}</span>}
                  <span className="font-medium text-[#17261D]">{formatoPrecio(item.precio)}</span> c/u
                </p>

                <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                  {/* Selector de cantidad */}
                  <div className="flex items-center rounded-xl border border-[#C9D6C0]">
                    <button
                      type="button"
                      onClick={() => eliminar(item.id)}
                      aria-label={`Quitar una unidad de ${item.nombre}`}
                      className="flex h-9 w-9 items-center justify-center rounded-l-xl text-[#17261D] transition-colors hover:bg-[#EAF0E2]"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="w-9 text-center text-sm font-bold tabular-nums text-[#17261D]" aria-live="polite">
                      {item.cantidad}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (!sinMasStock) agregar(item);
                        else toast.error(`Solo hay ${item.stock} unidades disponibles`);
                      }}
                      disabled={item.stock <= 0}
                      aria-label={`Agregar una unidad de ${item.nombre}`}
                      className={`flex h-9 w-9 items-center justify-center rounded-r-xl transition-colors ${
                        sinMasStock ? "cursor-not-allowed text-gray-300" : "text-[#17261D] hover:bg-[#EAF0E2]"
                      }`}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <span className="text-lg font-extrabold tabular-nums text-[#17261D]">
                    {formatoPrecio(item.precio * item.cantidad)}
                  </span>
                </div>

                {item.stock !== undefined && item.stock < 5 && (
                  <p className="mt-2 text-xs font-bold text-[#6B2A0E]">
                    {item.stock <= 0
                      ? "Agotado"
                      : sinMasStock
                      ? `Tienes las ${item.stock} unidades disponibles`
                      : `Solo quedan ${item.stock} unidades`}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Resumen */}
      <div className="rounded-2xl bg-[#F5F7F1] p-5">
        <dl className="flex flex-col gap-2.5 text-sm">
          <div className="flex justify-between text-[#4F6355]">
            <dt>Subtotal ({unidades} {unidades === 1 ? "unidad" : "unidades"})</dt>
            <dd className="tabular-nums text-[#17261D]">{formatoPrecio(total)}</dd>
          </div>

          {ahorro > 0 && (
            <div className="flex justify-between text-[#4F6355]">
              <dt>Ahorro en ofertas</dt>
              <dd className="font-bold tabular-nums text-[#14432F]">−{formatoPrecio(ahorro)}</dd>
            </div>
          )}

          <div className="flex justify-between text-[#4F6355]">
            <dt className="flex items-center gap-1.5">
              <TruckIcon className="h-4 w-4" />
              Envío
            </dt>
            <dd className="font-bold text-[#14432F]">Gratis</dd>
          </div>

          <div className="mt-2 flex items-baseline justify-between border-t border-[#E1E8DA] pt-3">
            <dt className="text-base font-bold text-[#17261D]">Total</dt>
            <dd className="text-2xl font-extrabold tabular-nums text-[#17261D]">{formatoPrecio(total)}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={finalizarCompra}
          className="mt-5 min-h-11 w-full rounded-xl bg-[#14432F] py-3 text-sm font-bold text-white transition-colors hover:bg-[#0E3323] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14432F]/40 focus-visible:ring-offset-2"
        >
          Finalizar compra
        </button>

        <button
          type="button"
          onClick={cerrar}
          className="mt-2 w-full rounded-xl py-2.5 text-sm font-bold text-[#14432F] transition-colors hover:bg-[#EAF0E2]"
        >
          Seguir comprando
        </button>

        <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-[#4F6355]">
          <span className="flex items-center gap-1">
            <BanknotesIcon className="h-4 w-4" />
            Pago contra entrega
          </span>
          <span className="flex items-center gap-1">
            <TruckIcon className="h-4 w-4" />
            Entrega en 24 h
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheckIcon className="h-4 w-4" />
            Compra segura
          </span>
        </div>
      </div>
    </div>
  );
};

export default Carrito;
