import { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";
import Contact from "../components/Contacto";
import Footer from "../components/Footer";

const ContactoPage = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <Toaster position="bottom-right" />

      {/* pt-[100px] = barra de envíos (36px) + navbar (64px) */}
      <main className="flex-1 pt-[100px]">
        <Contact />
      </main>

      <Footer />
    </div>
  );
};

export default ContactoPage;