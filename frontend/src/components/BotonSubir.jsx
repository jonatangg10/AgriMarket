import { useEffect, useState } from "react";
import { ArrowUpIcon } from "@heroicons/react/24/outline";

// A partir de cuántos px de scroll aparece el botón
const UMBRAL = 400;

/** Botón flotante para volver al inicio de la página. */
const BotonSubir = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > UMBRAL);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const subir = () => {
    const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducirMovimiento ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={subir}
      aria-label="Volver al inicio de la página"
      title="Volver arriba"
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#14432F] text-white shadow-lg shadow-green-900/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0E3323] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#9BD17A]/60 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ArrowUpIcon className="h-5 w-5" strokeWidth={2.5} />
    </button>
  );
};

export default BotonSubir;
