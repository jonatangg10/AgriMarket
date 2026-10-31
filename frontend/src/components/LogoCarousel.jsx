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
      <div className="w-full px-6"> {/* 🔹 el padding va aquí, no en el Swiper */}
        <Swiper
          direction="horizontal"
          modules={[Autoplay]}
          slidesPerView={1.3}
          centeredSlides={true}
          spaceBetween={10}
          loop={true}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
          }}
          speed={4000}
          breakpoints={{
            480: { slidesPerView: 2, spaceBetween: 15, centeredSlides: false },
            768: { slidesPerView: 3, spaceBetween: 20, centeredSlides: false },
            1024: { slidesPerView: 4, spaceBetween: 25, centeredSlides: false },
            1280: { slidesPerView: 6, spaceBetween: 10, centeredSlides: false },
          }}
          className="w-full" // 🔹 sin padding aquí
        >
          {vendedores.map((v, i) => (
            <SwiperSlide key={i}>
              <div className="flex flex-col items-center justify-center">
                <img
                  src={v.img}
                  alt={v.nombre}
                  className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-cover rounded-full shadow-md hover:scale-105 transition-transform duration-300"
                />
                <p className="mt-2 text-sm font-semibold text-gray-800 text-center">{v.nombre}</p>
                <p className="text-xs text-gray-500 text-center">{v.ubicacion}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default LogoCarousel;