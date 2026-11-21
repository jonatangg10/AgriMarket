import { FiUsers, FiBox } from "react-icons/fi";
import { MdOutlineBarChart } from "react-icons/md";
import PanelLayout from "./PanelLayout";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: MdOutlineBarChart, path: "/admin" },
  { id: "usuarios", label: "Usuarios", icon: FiUsers, path: "/admin-users" },
  { id: "productos", label: "Productos", icon: FiBox, path: "/admin-productos" },
];

const AdminLayout = ({ children, activeTab }) => (
  <PanelLayout
    activeTab={activeTab}
    menuItems={menuItems}
    subtitulo="Panel Administrativo"
    titulo="Panel de Administración"
    descripcion="Gestión general del sistema"
  >
    {children}
  </PanelLayout>
);

export default AdminLayout;
