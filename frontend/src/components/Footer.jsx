import {
  FaWhatsapp,
  FaRegCopyright,
} from "react-icons/fa6";

const whatsappURL = "https://wa.link/rnqsri";

const links = [
  { name: "Inicio", href: "#inicio" },
  { name: "Categorías", href: "#" },
  { name: "Ofertas", href: "#" },
  { name: "Novedades", href: "#" },
  { name: "Soporte", href: "#" },
  { name: "Mis pedidos", href: "#" },
];

const Footer = () => {
  return (
    <footer className="mt-16 w-full bg-[#101E16] py-10 text-[#C9D6CD]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6">
        {/* Fila superior: marca + WhatsApp */}
        <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-lg font-bold text-white">AgrilMarket</p>
            <p className="mt-1 flex items-center justify-center gap-1 whitespace-nowrap text-xs sm:justify-start sm:text-sm">
              <FaRegCopyright className="h-3.5 w-3.5 shrink-0" />
              2026 AgrilMarket. Todos los derechos reservados.
            </p>
          </div>

          <a
            href={whatsappURL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#F6D77A] px-5 py-3 text-sm font-bold text-[#2B2000] transition-colors hover:bg-[#F1CB5C]"
          >
            <FaWhatsapp className="h-5 w-5" />
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;