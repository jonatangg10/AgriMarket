import { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

/**
 * Ventana modal.
 * icon: componente de icono (ej. ShoppingCartIcon de heroicons) que se muestra junto al título.
 */
function Modal({ isOpen, onClose, title = "Tu carrito", icon: Icono, children }) {
  // Cerrar con Escape y bloquear el scroll del fondo mientras está abierto
  useEffect(() => {
    if (!isOpen) return;
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflowPrevio;
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo semi-transparente */}
      <div className="fixed inset-0 bg-[#17261D]/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />

      {/* Contenido modal */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
      >
        {/* Encabezado */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#E1E8DA] bg-white px-5 py-4">
          <h2 id="modal-titulo" className="flex items-center gap-3 text-lg font-extrabold text-[#17261D]">
            {Icono && (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E3F1E7] text-[#14432F]">
                <Icono className="h-5 w-5" />
              </span>
            )}
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-[#4F6355] transition-colors hover:bg-[#EAF0E2] hover:text-[#17261D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14432F]/40"
            aria-label="Cerrar"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
