import { FiBox } from "react-icons/fi";
import { InboxArrowDownIcon } from "@heroicons/react/24/outline";
import PanelLayout from "./PanelLayout";

const menuItems = [
  { id: "productos", label: "Mis Productos", icon: FiBox, path: "/admin-productos" },
  { id: "solicitudes", label: "Mis Solicitudes", icon: InboxArrowDownIcon, path: "/productor-solicitudes" },
];

const ProductorLayout = ({ children, activeTab }) => (
  <PanelLayout
    activeTab={activeTab}
    menuItems={menuItems}
    subtitulo="Panel de Productor"
    titulo="Mi Tienda Agrícola"
    descripcion="Gestión de productos y ventas"
  >
    {children}
  </PanelLayout>
);

export default ProductorLayout;
