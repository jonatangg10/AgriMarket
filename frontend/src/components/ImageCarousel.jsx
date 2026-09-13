import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

const slides = [
  {
    img: "/images/fondo.png",
    alt: "SonarQube Code Quality",
    badge: { text: "Code Quality & Security", color: "bg-green-600" },
    title: "SonarQube Analysis",
    description: "Limpia tu código y asegura tus despliegues. Detección automática de bugs, vulnerabilidades y code smells en más de 30 lenguajes.",
    button: { text: "Ver Análisis", color: "bg-white text-gray-800 hover:bg-gray-100" }
  },
  {
    img: "/images/fondo.png",
    alt: "Grafana Cloud Monitoring",
    badge: { text: "Observability Platform", color: "bg-orange-600" },
    title: "Grafana Cloud Dashboards",
    description: "Visualiza métricas, logs y trazas en tiempo real. La solución completa para monitoreo de infraestructura y aplicaciones a escala.",
    button: { text: "Explorar Dashboards", color: "bg-white text-gray-800 hover:bg-gray-100" }
  },
  {
    img: "/images/fondo.png",
    alt: "Oracle Linux Support",
    badge: { text: "Enterprise Edition", color: "bg-red-600" },
    title: "Linux Oracle Solutions",
    description: "Optimiza tu infraestructura con el rendimiento y la seguridad de Oracle Linux. Soporte especializado para entornos críticos.",
    button: { text: "Explorar Soluciones", color: "bg-blue-600 text-white hover:bg-blue-700" }
  },
  {
    img: "/images/fondo.png",
    alt: "Azure DevOps Pipelines",
    badge: { text: "DevOps & CI/CD", color: "bg-blue-500" },
    title: "Azure Pipelines",
    description: "Automatiza tus despliegues con Azure DevOps. Compila, prueba y despliega en cualquier nube con flujos de trabajo eficientes.",
    button: { text: "Ver Documentación", color: "bg-blue-600 text-white hover:bg-blue-700" }
  },
  {
    img: "/images/fondo.png",
    alt: "HashiCorp Vault",
    badge: { text: "Secret Management", color: "bg-gray-800" },
    title: "HashiCorp Vault",
    description: "Gestiona secretos y protege datos sensibles de tus aplicaciones. Control de acceso centralizado para contraseñas, tokens y certificados en la nube.",
    button: { text: "Ver Configuración", color: "bg-blue-600 text-white hover:bg-blue-700" }
  },
  {
    img: "/images/fondo.png",
    alt: "Microsoft Power Automate",
    badge: { text: "Business Process Automation", color: "bg-blue-400" },
    title: "Power Automate",
    description: "Optimiza tu productividad conectando tus aplicaciones favoritas. Crea flujos de trabajo inteligentes sin necesidad de código complejo.",
    button: { text: "Crear Flujo", color: "bg-blue-600 text-white hover:bg-blue-700" }
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