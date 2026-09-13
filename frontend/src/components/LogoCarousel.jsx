import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const logos = [
  "vendendores/fondo.png",
  "vendendores/fondo.png",
  "vendendores/fondo.png",
  "vendendores/fondo.png",
  "vendendores/fondo.png",
  "vendendores/fondo.png",
];

const LogoCarousel = () => {
  return (
    <section className="w-full py-16 bg-white overflow-hidden">
      
      <Swiper
        direction="horizontal"
        modules={[Autoplay]}
        slidesPerView={5}
        spaceBetween={60}
        loop={true}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
        }}
        speed={4000}
        className="w-full px-10"
      >
        {logos.map((logo, i) => (
          <SwiperSlide key={i}>
            <div className="flex items-center justify-center h-24 w-40">
              <img
                src={logo}
                alt="logo"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

    </section>
  );
};

export default LogoCarousel;