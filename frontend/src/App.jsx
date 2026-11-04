import React, { useContext, useState, useEffect, useMemo } from 'react';
import Producto from './components/Producto';
import Navbar from './components/Navbar';
import Modal from './components/Modal';
import LogoCarousel from './components/LogoCarousel';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import './App.css';
import { Toaster } from 'react-hot-toast';
import ImageCarousel from './components/ImageCarousel';
import { CarritoContext } from "./context/CarritoContext";
import Carrito from './components/Carrito';
import Comprar from './components/Comprar';
import { ChevronLeftIcon, ChevronRightIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";

// Datos fijos por ahora (aún no existen en la BD)
const CULTIVOS = ["Orgánico", "Cosechado hoy", "Compra por bulto"];

const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

function App() {
  const {
    categorias,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    carritoVisible,
    setCarritoVisible,
    agregarAlCarrito,
    obtenerProductosPaginados,
    error,
    comprarVisible,
    setComprarVisible,
    eliminarDelCarrito
  } = useContext(CarritoContext);

  const [productosPaginados, setProductosPaginados] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalProductos, setTotalProductos] = useState(0);
  const [loadingLocal, setLoadingLocal] = useState(true);
  const PAGE_SIZE = 12;

  // Filtros (se aplican sobre los productos de la página cargada)
  const [busqueda, setBusqueda] = useState("");
  const [municipiosSel, setMunicipiosSel] = useState([]);
  const [precioMax, setPrecioMax] = useState(null); // null = sin límite
  const [orden, setOrden] = useState("recientes");
  const [soloConStock, setSoloConStock] = useState(false);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false); // solo móvil

  // esto pa oscilar entre las de front precargadas y las nuevas de back
  const obtenerUrlImagen = (ruta) => {
    if (!ruta) return "/images/placeholder.jpg";
    if (ruta.startsWith('/uploads/')) return `https://agrimarket-yfbo.onrender.com${ruta}`;
    return ruta;
  };

  useEffect(() => {
    const cargarDatos = async () => {
      setLoadingLocal(true);
      const filtro = categoriaSeleccionada === "todos" ? "" : categoriaSeleccionada;

      const res = await obtenerProductosPaginados({
        page: paginaActual,
        pageSize: PAGE_SIZE,
        categoria: filtro
      });

      const productosListos = (res.productos || []).filter((p) => Number(p.estado_id) === 1).map(p => ({//mas facil quitar los inactivos en vista que en consulta
        ...p,
        imagen: obtenerUrlImagen(p.imagen)
      }));

      setProductosPaginados(productosListos);

      setTotalProductos(res.total || 0);
      setLoadingLocal(false);
    };

    cargarDatos();
  }, [paginaActual, categoriaSeleccionada]);

  useEffect(() => {
    setPaginaActual(1);
  }, [categoriaSeleccionada]);

  const restarStocklocal = (producto) => {//cuando agreguen altera el local de productos paginados peero no llama a bd que haga que recargue
    agregarAlCarrito(producto);
    setProductosPaginados(
      (prev) =>
        prev.map((p) => (p.id === producto.id ? { ...p, stock: p.stock - 1 } : p))
    );
  }

  const sumarStocklocal = (producto, eliminarTodo = false) => {
    const cantidadARestaurar = eliminarDelCarrito(producto, eliminarTodo);
    console.log(cantidadARestaurar)
    setProductosPaginados(
      (prev) =>
        prev.map((p) => p.id === producto ? { ...p, stock: p.stock + cantidadARestaurar } : p)
    );
  }

  const totalPaginas = Math.ceil(totalProductos / PAGE_SIZE);

  // Municipios disponibles según los productos cargados, con su conteo
  const municipiosDisponibles = useMemo(() => {
    const conteo = {};

    productosPaginados.forEach((p) => {
      if (p.municipio_nombre) {
        conteo[p.municipio_nombre] = (conteo[p.municipio_nombre] || 0) + 1;
      }
    });

    // Mantiene visibles los seleccionados aunque no estén en esta página
    municipiosSel.forEach((m) => {
      if (!(m in conteo)) conteo[m] = 0;
    });

    return Object.entries(conteo).sort((a, b) => a[0].localeCompare(b[0]));
  }, [productosPaginados, municipiosSel]);

  // Solo municipios que realmente tienen productos (para el buscador del hero)
  const municipiosConProductos = useMemo(
    () =>
      municipiosDisponibles
        .filter(([, cantidad]) => cantidad > 0)
        .map(([municipio]) => municipio),
    [municipiosDisponibles]
  );

  const toggleMunicipio = (municipio) => {
    setMunicipiosSel((prev) =>
      prev.includes(municipio)
        ? prev.filter((m) => m !== municipio)
        : [...prev, municipio]
    );
  };

  // Desde el hero: un solo municipio a la vez ("" = todos)
  const handleMunicipioHero = (valor) => {
    setMunicipiosSel(valor ? [valor] : []);
  };

  // Techo del slider de precio, según los productos cargados
  const precioTecho = useMemo(() => {
    const maximo = Math.max(0, ...productosPaginados.map((p) => Number(p.precio) || 0));
    return Math.max(10000, Math.ceil(maximo / 500) * 500);
  }, [productosPaginados]);

  // Aplica búsqueda, municipio, precio, stock y orden
  const productosVisibles = useMemo(() => {
    let lista = [...productosPaginados];

    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      lista = lista.filter((p) => p.nombre?.toLowerCase().includes(q));
    }
    if (municipiosSel.length > 0) {
      lista = lista.filter((p) => municipiosSel.includes(p.municipio_nombre));
    }
    if (precioMax !== null) {
      lista = lista.filter((p) => Number(p.precio) <= precioMax);
    }
    if (soloConStock) {
      lista = lista.filter((p) => p.stock > 0);
    }
    if (orden === "menor") lista.sort((a, b) => Number(a.precio) - Number(b.precio));
    if (orden === "mayor") lista.sort((a, b) => Number(b.precio) - Number(a.precio));

    return lista;
  }, [productosPaginados, busqueda, municipiosSel, precioMax, soloConStock, orden]);

  const hayFiltros =
    busqueda || municipiosSel.length > 0 || precioMax !== null || soloConStock || orden !== "recientes";

  const limpiarFiltros = () => {
    setBusqueda("");
    setMunicipiosSel([]);
    setPrecioMax(null);
    setSoloConStock(false);
    setOrden("recientes");
  };

  const irAProductos = () => {
    document.getElementById("productos")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const seleccionarCategoria = (cat) => {
    setCategoriaSeleccionada(cat);
    irAProductos();
  };

  const categoriasTiles = ["todos", ...categorias.filter((c) => c.toLowerCase() !== "todos")];

  const checkboxClass = "h-4 w-4 rounded border-[#C9D6C0] accent-[#14432F]";
  const paginaBtnClass =
    "flex min-h-11 items-center rounded-xl border border-[#C9D6C0] bg-white px-4 py-2 text-sm font-bold text-[#17261D] transition-colors hover:bg-[#EAF0E2] disabled:cursor-not-allowed disabled:opacity-50";

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-red-500 text-lg">{error}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F7F1]">
      <Navbar onAbrirCarrito={() => setCarritoVisible(true)} />
      <ImageCarousel
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        municipios={municipiosConProductos}
        municipiosSel={municipiosSel}
        onMunicipioChange={handleMunicipioHero}
        onBuscar={irAProductos}
      />
      <Toaster position="bottom-right" />

      {/* EXPLORA POR CATEGORÍA */}
      <section id="categorias" className="mx-auto max-w-6xl px-4 pt-14">
        <h2 className="mb-5 text-2xl font-extrabold tracking-tight text-[#17261D] sm:text-3xl">
          Explora por categoría
        </h2>

        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
          {categoriasTiles.map((cat) => {
            const activa = categoriaSeleccionada === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => seleccionarCategoria(cat)}
                aria-pressed={activa}
                className={`flex flex-col gap-2.5 rounded-2xl border bg-white p-4 text-left transition-all hover:shadow-sm ${
                  activa ? "border-[#14432F] ring-2 ring-[#CFE7D6]" : "border-[#E1E8DA]"
                }`}
              >
                <div
                  className={`flex h-14 items-center justify-center rounded-xl text-xl font-extrabold ${
                    activa ? "bg-[#14432F] text-white" : "bg-[#DCE6D3] text-[#14432F]"
                  }`}
                >
                  {cat.charAt(0).toUpperCase()}
                </div>
                <span className="text-[15px] font-bold text-[#17261D]">
                  {cat === "todos" ? "Todos" : capitalizar(cat)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* PRODUCTOS DE TEMPORADA */}
      <section id="productos" className="mx-auto max-w-6xl scroll-mt-[116px] px-4 pt-14 pb-4">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#17261D] sm:text-3xl">
            Productos de temporada
          </h2>

          {/* Botón de filtros solo en móvil */}
          <button
            type="button"
            onClick={() => setFiltrosAbiertos((v) => !v)}
            className="flex min-h-11 items-center gap-2 rounded-xl border border-[#C9D6C0] bg-white px-4 text-sm font-bold text-[#17261D] lg:hidden"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            Filtros
            {municipiosSel.length > 0 && (
              <span className="rounded-full bg-[#14432F] px-2 text-xs text-white">
                {municipiosSel.length}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[260px_1fr]">
          {/* PANEL DE FILTROS */}
          <aside
            className={`${filtrosAbiertos ? "flex" : "hidden"} flex-col gap-5 rounded-2xl border border-[#E1E8DA] bg-white p-5 lg:sticky lg:top-[116px] lg:flex`}
          >
            <div className="flex items-center justify-between">
              <b className="text-[#17261D]">Filtros</b>
              {hayFiltros && (
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="text-xs font-bold text-[#14432F] hover:underline"
                >
                  Limpiar
                </button>
              )}
            </div>

            <label className="flex flex-col gap-2 text-sm font-bold text-[#17261D]">
              Buscar
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar producto..."
                className="min-h-11 rounded-xl border border-[#C9D6C0] px-3 text-sm font-normal outline-none focus:border-[#14432F] focus:ring-2 focus:ring-[#CFE7D6]"
              />
            </label>

            {/* Municipio: valores reales de producto.municipio_nombre */}
            <fieldset className="flex flex-col gap-2 text-sm">
              <legend className="mb-2 font-bold text-[#17261D]">Municipio</legend>

              {municipiosDisponibles.length === 0 ? (
                <p className="text-xs text-[#4F6355]">Sin municipios para mostrar.</p>
              ) : (
                municipiosDisponibles.map(([municipio, cantidad]) => (
                  <label key={municipio} className="flex items-center gap-2 text-[#17261D]">
                    <input
                      type="checkbox"
                      checked={municipiosSel.includes(municipio)}
                      onChange={() => toggleMunicipio(municipio)}
                      className={checkboxClass}
                    />
                    <span className="flex-1">{municipio}</span>
                    <span className="text-xs text-[#4F6355]">{cantidad}</span>
                  </label>
                ))
              )}
            </fieldset>

            {/* Cultivo: datos fijos, aún sin efecto */}
            <fieldset className="flex flex-col gap-2 text-sm">
              <legend className="mb-2 font-bold text-[#17261D]">Cultivo</legend>
              {CULTIVOS.map((c) => (
                <label key={c} className="flex items-center gap-2 text-[#17261D]">
                  <input type="checkbox" className={checkboxClass} />
                  {c}
                </label>
              ))}
            </fieldset>

            <label className="flex items-center gap-2 text-sm font-bold text-[#17261D]">
              <input
                type="checkbox"
                checked={soloConStock}
                onChange={(e) => setSoloConStock(e.target.checked)}
                className={checkboxClass}
              />
              Solo con unidades disponibles
            </label>

            <label className="flex flex-col gap-2 text-sm font-bold text-[#17261D]">
              <span className="flex justify-between">
                Precio máximo
                <span className="font-medium text-[#4F6355]">
                  ${(precioMax ?? precioTecho).toLocaleString("es-CO")}
                </span>
              </span>
              <input
                type="range"
                min="500"
                max={precioTecho}
                step="500"
                value={precioMax ?? precioTecho}
                onChange={(e) => {
                  const valor = Number(e.target.value);
                  setPrecioMax(valor >= precioTecho ? null : valor);
                }}
                className="accent-[#14432F]"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-bold text-[#17261D]">
              Ordenar por
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                className="min-h-11 rounded-xl border border-[#C9D6C0] bg-white px-3 text-sm font-medium"
              >
                <option value="recientes">Más recientes</option>
                <option value="menor">Menor precio</option>
                <option value="mayor">Mayor precio</option>
              </select>
            </label>
          </aside>

          {/* LISTADO */}
          <div>
            {loadingLocal ? (
              <div className="flex justify-center py-20">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-[#14432F]"></div>
              </div>
            ) : productosVisibles.length === 0 ? (
              <div className="rounded-2xl border border-[#E1E8DA] bg-white p-10 text-center text-[#4F6355]">
                No encontramos productos con esos filtros.
                {hayFiltros && (
                  <button
                    type="button"
                    onClick={limpiarFiltros}
                    className="mt-3 block w-full text-sm font-bold text-[#14432F] hover:underline"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {productosVisibles.map((prod) => (
                  <Producto
                    key={prod.id}
                    producto={prod}
                    agregarAlCarrito={restarStocklocal}
                  />
                ))}
              </div>
            )}

            {/* PAGINACIÓN */}
            {!loadingLocal && totalPaginas > 1 && (
              <div className="mt-10 flex items-center justify-between border-t border-[#E1E8DA] pt-6">
                <div className="text-sm font-medium text-[#4F6355]">
                  Página <span className="text-[#17261D]">{paginaActual}</span> de{" "}
                  <span className="text-[#17261D]">{totalPaginas}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setPaginaActual((p) => Math.max(1, p - 1));
                      irAProductos();
                    }}
                    disabled={paginaActual === 1}
                    className={paginaBtnClass}
                  >
                    <ChevronLeftIcon className="mr-1 h-4 w-4" />
                    Anterior
                  </button>
                  <button
                    onClick={() => {
                      setPaginaActual((p) => Math.min(totalPaginas, p + 1));
                      irAProductos();
                    }}
                    disabled={paginaActual === totalPaginas}
                    className={paginaBtnClass}
                  >
                    Siguiente
                    <ChevronRightIcon className="ml-1 h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Modal isOpen={carritoVisible} onClose={() => setCarritoVisible(false)} title="🛒 Tu Carrito">
        <Carrito Agregar={restarStocklocal} Eliminar={sumarStocklocal} />
      </Modal>
      <Modal isOpen={comprarVisible} onClose={() => setComprarVisible(false)} title="✅ Finaliza tu compra">
        <Comprar />
      </Modal>

      <LogoCarousel />
      <HowItWorks />
      <Footer />
    </div>
  );
}

export default App;