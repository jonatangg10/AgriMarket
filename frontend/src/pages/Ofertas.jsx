import { useMemo } from "react";
import ListadoProductosPagina from "../components/ListadoProductosPagina";
import useProductosActivos from "../hooks/useProductosActivos";
import { esOferta, obtenerDescuento } from "../utils/ofertas";

const Ofertas = () => {
  const { productos, cargando, error } = useProductosActivos();

  // Ofertas con stock, de mayor a menor descuento ("Oferta" sin % va al final)
  const ofertas = useMemo(
    () =>
      productos
        .filter((p) => esOferta(p) && p.stock > 0)
        .sort((a, b) => (obtenerDescuento(b.etiqueta) || 0) - (obtenerDescuento(a.etiqueta) || 0)),
    [productos]
  );

  const mayorDescuento = Math.max(0, ...ofertas.map((p) => obtenerDescuento(p.etiqueta) || 0));

  return (
    <ListadoProductosPagina
      titulo="Ofertas"
      descripcion="Productos del campo con descuento, directo de los productores."
      productos={ofertas}
      cargando={cargando}
      error={error}
      vacio="Por ahora no hay ofertas disponibles. ¡Vuelve pronto!"
    >
      {!cargando && !error && ofertas.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-3">
          <span className="rounded-full bg-[#FBD9C9] px-4 py-2 text-sm font-bold text-[#6B2A0E]">
            {ofertas.length} {ofertas.length === 1 ? "producto en oferta" : "productos en oferta"}
          </span>
          {mayorDescuento > 0 && (
            <span className="rounded-full bg-[#14432F] px-4 py-2 text-sm font-bold text-white">
              Hasta {mayorDescuento}% de descuento
            </span>
          )}
        </div>
      )}
    </ListadoProductosPagina>
  );
};

export default Ofertas;
