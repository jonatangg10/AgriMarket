import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../context/AuthContext"; // Importar contexto
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Toaster } from "react-hot-toast";

const Registrarse = () => {

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <Toaster position="bottom-right" />
      <main className="flex flex-grow items-center justify-center px-4 pt-[120px] pb-0">
        <div className="bg-white flex flex-col md:flex-row rounded-3xl shadow-xl overflow-hidden max-w-4xl w-full">

        {/* Formulario */}
        <div className="w-full md:w-1/2 p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-[#14432F]">Registrarse</h2>
        </div>
      </div>
      </main>
      <Footer />
    </div>
    
  );
};

export default Registrarse;