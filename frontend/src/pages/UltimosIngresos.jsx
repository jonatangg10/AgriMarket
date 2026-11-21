import { useMemo } from "react";
import ListadoProductosPagina from "../components/ListadoProductosPagina";
import useProductosActivos from "../hooks/useProductosActivos";

const CANTIDAD = 12;

const UltimosIngresos = () => {
  const { productos, cargando, error } = useProductosActivos();

  // La tabla no tiene fecha de creación: el id autoincremental indica el orden de ingreso
  const recientes = useMemo(
    () => [...productos].sort((a, b) => b.id - a.id).slice(0, CANTIDAD),
    [productos]
  );

  return (
    <ListadoProductosPagina
      titulo="Últimos ingresos"
      descripcion={`Los ${CANTIDAD} productos más recientes que nuestros productores han publicado.`}
      productos={recientes}
      cargando={cargando}
      error={error}
      vacio="Aún no hay productos publicados."
    />
  );
};

export default UltimosIngresos;
