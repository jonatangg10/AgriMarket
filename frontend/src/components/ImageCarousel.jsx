// components/ImageCarousel.jsx
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

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
        {/* Slide 1 - SonarQube */}
        <div className="relative h-80 md:h-[690px] w-full">
          <img 
            src="/images/fondo.png" 
            alt="SonarQube Code Quality" 
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end pb-8 md:pb-12 px-6 md:px-12">
            <div className="text-left">
              <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded mb-3 inline-block">Code Quality & Security</span>
              <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 uppercase">SonarQube Analysis</h3>
              <p className="text-white text-sm md:text-lg max-w-xl">Limpia tu código y asegura tus despliegues. Detección automática de bugs, vulnerabilidades y code smells en más de 30 lenguajes.</p>
              <button className="mt-4 bg-white text-gray-800 hover:bg-gray-100 px-6 py-2 rounded-md font-medium transition-colors cursor-pointer">
                Ver Análisis
              </button>
            </div>
          </div>
        </div>
        
        {/* Slide 2 - Grafana Cloud */}
        <div className="relative h-80 md:h-[690px] w-full">
          <img 
            src="/images/fondo.png" 
            alt="Grafana Cloud Monitoring" 
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end pb-8 md:pb-12 px-6 md:px-12">
            <div className="text-left">
              <span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded mb-3 inline-block">Observability Platform</span>
              <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 uppercase">Grafana Cloud Dashboards</h3>
              <p className="text-white text-sm md:text-lg max-w-xl">Visualiza métricas, logs y trazas en tiempo real. La solución completa para monitoreo de infraestructura y aplicaciones a escala.</p>
              <button className="mt-4 bg-white text-gray-800 hover:bg-gray-100 px-6 py-2 rounded-md font-medium transition-colors cursor-pointer">
                Explorar Dashboards
              </button>
            </div>
          </div>
        </div>
        
        {/* Slide 3 - Oracle Linux (Existente) */}
        <div className="relative h-80 md:h-[690px] w-full">
          <img 
            src="/images/fondo.png" 
            alt="Oracle Linux Support" 
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end pb-8 md:pb-12 px-6 md:px-12">
            <div className="text-left">
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded mb-3 inline-block">Enterprise Edition</span>
              <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 uppercase">Linux Oracle Solutions</h3>
              <p className="text-white text-sm md:text-lg max-w-xl">Optimiza tu infraestructura con el rendimiento y la seguridad de Oracle Linux. Soporte especializado para entornos críticos.</p>
              <button className="mt-4 bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-md font-medium transition-colors cursor-pointer">
                Explorar Soluciones
              </button>
            </div>
          </div>
        </div>
              
        {/* Slide 4 - Azure Pipelines (Existente) */}
        <div className="relative h-80 md:h-[690px] w-full">
          <img 
            src="/images/fondo.png" 
            alt="Azure DevOps Pipelines" 
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end pb-8 md:pb-12 px-6 md:px-12">
            <div className="text-left">
              <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded mb-3 inline-block">DevOps & CI/CD</span>
              <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 uppercase">Azure Pipelines</h3>
              <p className="text-white text-sm md:text-lg max-w-xl">Automatiza tus despliegues con Azure DevOps. Compila, prueba y despliega en cualquier nube con flujos de trabajo eficientes.</p>
              <button className="mt-4 bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-md font-medium transition-colors cursor-pointer">
                Ver Documentación
              </button>
            </div>
          </div>
        </div>

        {/* Slide 5 - HashiCorp Vault */}
        <div className="relative h-80 md:h-[690px] w-full">
          <img 
            src="/images/fondo.png" 
            alt="HashiCorp Vault" 
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end pb-8 md:pb-12 px-6 md:px-12">
            <div className="text-left">
              <span className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded mb-3 inline-block">Secret Management</span>
              <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 uppercase">HashiCorp Vault</h3>
              <p className="text-white text-sm md:text-lg max-w-xl">Gestiona secretos y protege datos sensibles de tus aplicaciones. Control de acceso centralizado para contraseñas, tokens y certificados en la nube.</p>
              <button className="mt-4 bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-md font-medium transition-colors cursor-pointer">
                Ver Configuración
              </button>
            </div>
          </div>
        </div>

        {/* Slide 6 - Power Automate */}
        <div className="relative h-80 md:h-[690px] w-full">
          <img 
            src="/images/fondo.png" 
            alt="Microsoft Power Automate" 
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end pb-8 md:pb-12 px-6 md:px-12">
            <div className="text-left">
              <span className="bg-blue-400 text-white text-xs font-bold px-2 py-1 rounded mb-3 inline-block">Business Process Automation</span>
              <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 uppercase">Power Automate</h3>
              <p className="text-white text-sm md:text-lg max-w-xl">Optimiza tu productividad conectando tus aplicaciones favoritas. Crea flujos de trabajo inteligentes sin necesidad de código complejo.</p>
              <button className="mt-4 bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-md font-medium transition-colors cursor-pointer">
                Crear Flujo
              </button>
            </div>
          </div>
        </div>
      </Carousel>
    </div>
  );
}

export default ImageCarousel;