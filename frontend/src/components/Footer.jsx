import { FaWhatsapp, FaGithub, FaLinkedin, FaRegCopyright, FaInstagram, FaYoutube } from "react-icons/fa6";

const githubURL = import.meta.env.VITE_GITHUB_URL;
const linkedinURL = import.meta.env.VITE_LINKEDIN_URL;
const instagramURL = import.meta.env.VITE_INSTAGRAM_URL;

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-neutral-300 py-10 rounded-lg">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-6 px-6">
        {/* Navigation Links with Icons */}
        <nav className="flex flex-wrap justify-center gap-6 text-sm font-medium">
          <a href="#inicio" className="flex items-center gap-1 hover:text-white">
            Inicio
          </a>
          <a href="#" className="flex items-center gap-1 hover:text-white">
            Categorias
          </a>
          <a href="#" className="flex items-center gap-1 hover:text-white">
            Ofertas
          </a>
          <a href="#" className="flex items-center gap-1 hover:text-white">
            Novedades
          </a>
          <a href="#" className="flex items-center gap-1 hover:text-white">
            Soporte
          </a>
          <a href="#" className="flex items-center gap-1 hover:text-white">
            Mis pedidos
          </a>
        </nav>
        {/* Social Media Icons */}
        <div className="flex gap-6 text-neutral-400">
          <a target="_blank" href={githubURL} className="hover:text-white">
            <FaGithub className="h-5 w-5" />
          </a>
          <a target="_blank" href={linkedinURL} className="hover:text-white">
            <FaLinkedin className="h-5 w-5" />
          </a>
          <a target="_blank" href={instagramURL} className="hover:text-white">
            <FaInstagram className="h-5 w-5" />
          </a>
        </div>
        {/* Copyright */}
        <p className="flex items-center gap-1 text-sm text-neutral-500">
          <FaRegCopyright className="h-4 w-4" />
           2026 🚜 AgrilMarket. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;