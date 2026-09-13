import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

const slides = [
  {
    img: "/fondos/Cafe-Huila.png",
    alt: "Café de Huila",
    badge: { text: "Región Andina", color: "bg-green-700" },
    title: "Café Especial de Huila",
    description: "Cultivado en las montañas del Huila, con lluvias constantes que dan un grano balanceado y aromático. Reconocido mundialmente por su calidad.",
    button: { text: "Ver Café", color: "bg-green-700 text-white hover:bg-green-800" }
  },
  {
    img: "/fondos/Arroz-Llanos.png",
    alt: "Arroz de los Llanos",
    badge: { text: "Cosecha Llanera", color: "bg-yellow-600" },
    title: "Arroz de los Llanos Orientales",
    description: "Producido en extensas planicies con riego natural. La variabilidad climática del fenómeno del Niño afecta su rendimiento, pero mantiene su sabor tradicional.",
    button: { text: "Comprar Arroz", color: "bg-yellow-600 text-white hover:bg-yellow-700" }
  },
  {
    img: "/fondos/Mango-Tolima.png",
    alt: "Mango de Tolima",
    badge: { text: "Frutas Tropicales", color: "bg-orange-500" },
    title: "Mango Azúcar del Tolima",
    description: "Cosechado en tierras cálidas del Tolima. Las lluvias intensas favorecen su dulzura y jugosidad, ideal para jugos y postres.",
    button: { text: "Ver Mangos", color: "bg-orange-500 text-white hover:bg-orange-600" }
  },
  {
    img: "/fondos/Papa-Boyaca.png",
    alt: "Papa Criolla Boyacá",
    badge: { text: "Tubérculos Andinos", color: "bg-brown-600" },
    title: "Papa Criolla de Boyacá",
    description: "Sembrada en suelos fríos de Boyacá. La cosecha depende de lluvias regulares; resistente a sequías moderadas del fenómeno del Niño.",
    button: { text: "Comprar Papa", color: "bg-brown-600 text-white hover:bg-brown-700" }
  },
  {
    img: "/fondos/Cacao-Santander.png",
    alt: "Cacao de Santander",
    badge: { text: "Cultivo Sostenible", color: "bg-purple-700" },
    title: "Cacao Fino de Santander",
    description: "Producido bajo sombra en bosques húmedos. Las lluvias constantes permiten un grano de alta calidad para chocolates artesanales.",
    button: { text: "Explorar Cacao", color: "bg-purple-700 text-white hover:bg-purple-800" }
  },
  {
    img: "/fondos/Aguacate-Antioquia.png",
    alt: "Aguacate Hass Antioquia",
    badge: { text: "Frutas Premium", color: "bg-green-600" },
    title: "Aguacate Hass de Antioquia",
    description: "Cultivado en climas templados de Antioquia. Su producción se ve afectada por sequías del fenómeno del Niño, pero conserva su textura cremosa.",
    button: { text: "Ver Aguacates", color: "bg-green-600 text-white hover:bg-green-700" }
  }
];

function ImageCarousel() {
  return (
    <div id="inicio" className="w-full shadow-xl">
      <Carousel 
        showThumbs={false}
        autoPlay
        infiniteLoop
        interval={4000}
        showStatus={false}
        showArrows={true}
        stopOnHover={true}
        swipeable={true}
        dynamicHeight={false}
        emulateTouch={true}
        renderArrowPrev={(onClickHandler, hasPrev, label) =>
          hasPrev && (
            <button
              type="button"
              onClick={onClickHandler}
              title={label}
              className="absolute top-1/2 left-4 z-10 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 rounded-full w-10 h-10 flex items-center justify-center text-white transition-all"
            >
              ❮
            </button>
          )
        }
        renderArrowNext={(onClickHandler, hasNext, label) =>
          hasNext && (
            <button
              type="button"
              onClick={onClickHandler}
              title={label}
              className="absolute top-1/2 right-4 z-10 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 rounded-full w-10 h-10 flex items-center justify-center text-white transition-all"
            >
              ❯
            </button>
          )
        }
        renderIndicator={(onClickHandler, isSelected, index, label) => (
          <button
            type="button"
            onClick={onClickHandler}
            title={label}
            className={`inline-block w-3 h-3 mx-1 rounded-full transition-colors ${
              isSelected ? 'bg-white' : 'bg-white/50'
            }`}
          />
        )}
      >
        {slides.map((slide, index) => (
          <div key={index} className="relative h-80 md:h-[690px] w-full">
            <img src={slide.img} alt={slide.alt} className="object-cover w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end pb-8 md:pb-12 px-6 md:px-12">
              <div className="text-left">
                <span className={`${slide.badge.color} text-white text-xs font-bold px-2 py-1 rounded mb-3 inline-block`}>
                  {slide.badge.text}
                </span>
                <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 uppercase">{slide.title}</h3>
                <p className="text-white text-sm md:text-lg max-w-xl">{slide.description}</p>
                <button className={`mt-4 px-6 py-2 rounded-md font-medium transition-colors cursor-pointer ${slide.button.color}`}>
                  {slide.button.text}
                </button>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}

export default ImageCarousel;