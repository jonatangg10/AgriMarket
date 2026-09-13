import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const vendedores = [
  { img: "vendendores/Juan-Perez.png", nombre: "Juan Pérez", ubicacion: "Villeta, Cundinamarca" },
  { img: "vendendores/Maria-Lopez.png", nombre: "María López", ubicacion: "Tobia, Cundinamarca" },
  { img: "vendendores/Carlos-Gomez.png", nombre: "Carlos Gómez", ubicacion: "Nimaima, Cundinamarca" },
  { img: "vendendores/Ana-Rodriguez.png", nombre: "Ana Rodríguez", ubicacion: "La Vega, Cundinamarca" },
  { img: "vendendores/Pedro-Sanchez.png", nombre: "Pedro Sánchez", ubicacion: "Guaduas, Cundinamarca" },
  { img: "vendendores/Laura-Torres.png", nombre: "Laura Torres", ubicacion: "Supatá, Cundinamarca" },
  { img: "vendendores/Katerine-Barrera.png", nombre: "Katerine Barrera", ubicacion: "Sasaima, Cundinamarca" },
];

const LogoCarousel = () => {
  return (
    <section className="w-full py-16 bg-white overflow-hidden">
      <Swiper
        direction="horizontal"
        modules={[Autoplay]}
        slidesPerView={6}
        spaceBetween={10} // 🔹 reduce el espacio entre imágenes
        loop={true}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
        }}
        speed={4000}
        className="w-full px-6" // 🔹 menos padding lateral
      >
        {vendedores.map((v, i) => (
          <SwiperSlide key={i}>
            <div className="flex flex-col items-center justify-center">
              <img
                src={v.img}
                alt={v.nombre}
                className="w-48 h-48 object-cover rounded-full shadow-md hover:scale-105 transition-transform duration-300"
              />
              <p className="mt-2 text-sm font-semibold text-gray-800">{v.nombre}</p>
              <p className="text-xs text-gray-500">{v.ubicacion}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default LogoCarousel;
