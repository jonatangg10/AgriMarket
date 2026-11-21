import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { FiUsers, FiShoppingBag, FiBox, FiRefreshCw, FiClock, FiCheckCircle, FiXCircle, FiAlertTriangle } from "react-icons/fi";
import { FaDollarSign } from "react-icons/fa";
import {
  Tarjeta,
  VerDatos,
  Indicador,
  GraficaColumnas,
  BarraSegmentada,
  BarrasHorizontales,
  formatoCOP,
  formatoCOPCompacto,
} from "../components/dashboard/Graficas";

const API = "https://agrimarket-yfbo.onrender.com/api";
const DIAS_GRAFICA = 14;

// Estados de venta: 1-4 en curso, 5 entregada, 6 rechazada, 7 cancelada
const ESTADOS_NO_VALIDOS = [6, 7];

// Colores de estado (reservados: siempre van con icono + texto)
const STATUS = { enCurso: "#fab219", entregada: "#0ca30c", cancelada: "#d03b3b" };
// Categóricos validados (colorblind-safe en este orden)
const SERIES = ["#2a78d6", "#eb6834", "#1baf7a"];

const ROLES = { 1: "Administradores", 2: "Clientes", 3: "Agricultores" };
const ROL_SINGULAR = { 1: "Administrador", 2: "Cliente", 3: "Agricultor" };

// "YYYY-MM-DD" de hoy en Bogotá (las fechas de la BD ya vienen en hora de Bogotá)
const hoyBogota = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());

const sumarDias = (yyyyMmDd, dias) => {
  const [a, m, d] = yyyyMmDd.split("-").map(Number);
  const f = new Date(Date.UTC(a, m - 1, d + dias));
  return f.toISOString().slice(0, 10);
};

const fechaCorta = (yyyyMmDd, opciones) =>
  new Intl.DateTimeFormat("es-CO", { timeZone: "UTC", ...opciones }).format(new Date(`${yyyyMmDd}T12:00:00Z`));

const Dashboard = () => {
  const [ventas, setVentas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [recargar, setRecargar] = useState(0);

  useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      setCargando(true);
      setError(null);
      try {
        const [rv, ru, rp] = await Promise.all([
          fetch(`${API}/ventas`),
          fetch(`${API}/usuarios`),
          fetch(`${API}/productos`),
        ]);
        if (!rv.ok || !ru.ok || !rp.ok) throw new Error("No se pudieron cargar los datos del panel");
        const [dv, du, dp] = await Promise.all([rv.json(), ru.json(), rp.json()]);
        if (cancelado) return;
        setVentas(Array.isArray(dv) ? dv : []);
        setUsuarios(du.usuarios || []);
        setProductos(Array.isArray(dp) ? dp : []);
      } catch (err) {
        if (!cancelado) setError(err.message);
      } finally {
        if (!cancelado) setCargando(false);
      }
    };
    cargar();
    return () => {
      cancelado = true;
    };
  }, [recargar]);

  const resumen = useMemo(() => {
    const hoy = hoyBogota();
    const hace30 = sumarDias(hoy, -29);

    const ventasValidas = ventas.filter((v) => !ESTADOS_NO_VALIDOS.includes(Number(v.estado_id)));
    const ingresos = ventasValidas.reduce((s, v) => s + (Number(v.total) || 0), 0);
    const ingresos30 = ventasValidas
      .filter((v) => (v.fecha_creacion || "").slice(0, 10) >= hace30)
      .reduce((s, v) => s + (Number(v.total) || 0), 0);

    // Ventas por día (últimos 14 días, incluidos los días sin ventas)
    const porDia = {};
    for (let i = DIAS_GRAFICA - 1; i >= 0; i--) porDia[sumarDias(hoy, -i)] = { total: 0, cantidad: 0 };
    ventasValidas.forEach((v) => {
      const dia = (v.fecha_creacion || "").slice(0, 10);
      if (porDia[dia]) {
        porDia[dia].total += Number(v.total) || 0;
        porDia[dia].cantidad += 1;
      }
    });
    const serieDias = Object.entries(porDia).map(([dia, d]) => ({
      clave: dia,
      etiqueta: fechaCorta(dia, { day: "numeric" }),
      etiquetaLarga: fechaCorta(dia, { weekday: "short", day: "numeric", month: "short" }),
      valor: d.total,
      cantidad: d.cantidad,
    }));

    // Estado de los pedidos
    const contar = (fn) => ventas.filter((v) => fn(Number(v.estado_id))).length;
    const estados = [
      { id: "curso", nombre: "En curso", valor: contar((e) => e >= 1 && e <= 4), color: STATUS.enCurso, textoClaro: false, icono: FiClock },
      { id: "entregada", nombre: "Entregados", valor: contar((e) => e === 5), color: STATUS.entregada, textoClaro: true, icono: FiCheckCircle },
      { id: "cancelada", nombre: "Cancelados o rechazados", valor: contar((e) => e === 6 || e === 7), color: STATUS.cancelada, textoClaro: true, icono: FiXCircle },
    ];

    // Usuarios por rol
    const roles = [2, 3, 1].map((rol, i) => ({
      id: rol,
      nombre: ROLES[rol],
      valor: usuarios.filter((u) => Number(u.rol_id) === rol).length,
      color: SERIES[i],
      textoClaro: true,
    }));
    const nuevos30 = usuarios.filter((u) => (u.fecha_creacion || "").slice(0, 10) >= hace30).length;

    // Productos
    const activos = productos.filter((p) => Number(p.estado_id) === 1);
    const stockBajo = activos.filter((p) => p.stock < 5).sort((a, b) => a.stock - b.stock);
    const conteoCategorias = {};
    activos.forEach((p) => {
      const c = p.categoria || "Sin categoría";
      conteoCategorias[c] = (conteoCategorias[c] || 0) + 1;
    });
    const categorias = Object.entries(conteoCategorias)
      .map(([nombre, valor]) => ({ nombre, valor }))
      .sort((a, b) => b.valor - a.valor);

    const ultimosUsuarios = [...usuarios]
      .sort((a, b) => (b.fecha_creacion || "").localeCompare(a.fecha_creacion || "") || b.id - a.id)
      .slice(0, 5);

    return {
      ingresos,
      ingresos30,
      numVentas: ventasValidas.length,
      ticketPromedio: ventasValidas.length ? ingresos / ventasValidas.length : 0,
      serieDias,
      ventasPeriodo: serieDias.reduce((s, d) => s + d.valor, 0),
      estados,
      roles,
      nuevos30,
      activos: activos.length,
      inactivos: productos.length - activos.length,
      stockBajo,
      categorias,
      ultimosUsuarios,
    };
  }, [ventas, usuarios, productos]);

  return (
    <AdminLayout activeTab="dashboard">
      <div className="space-y-8">
        {/* Encabezado */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Dashboard</h1>
            <p className="mt-1 font-medium text-slate-500">Resumen de ventas, usuarios y productos de AgrilMarket.</p>
          </div>

          <button
            onClick={() => setRecargar((n) => n + 1)}
            disabled={cargando}
            className="flex items-center gap-2 self-start rounded-xl bg-[#14432F] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-green-900/20 transition-all hover:bg-[#0E3323] disabled:opacity-60 md:self-auto"
          >
            <FiRefreshCw className={`h-4 w-4 ${cargando ? "animate-spin" : ""}`} />
            {cargando ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <FiAlertTriangle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {cargando && ventas.length === 0 && usuarios.length === 0 ? (
          <div className="flex justify-center py-24">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-[#14432F]"></div>
          </div>
        ) : (
          <>
            {/* Indicadores */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <Indicador
                etiqueta="Ingresos totales"
                valor={formatoCOPCompacto(resumen.ingresos)}
                detalle={`${formatoCOPCompacto(resumen.ingresos30)} en los últimos 30 días`}
                icono={FaDollarSign}
              />
              <Indicador
                etiqueta="Ventas"
                valor={resumen.numVentas.toLocaleString("es-CO")}
                detalle={`Ticket promedio ${formatoCOPCompacto(resumen.ticketPromedio)}`}
                icono={FiShoppingBag}
              />
              <Indicador
                etiqueta="Usuarios"
                valor={usuarios.length.toLocaleString("es-CO")}
                detalle={`${resumen.nuevos30} nuevos en los últimos 30 días`}
                icono={FiUsers}
              />
              <Indicador
                etiqueta="Productos activos"
                valor={resumen.activos.toLocaleString("es-CO")}
                detalle={
                  resumen.stockBajo.length > 0
                    ? `${resumen.stockBajo.length} con stock bajo · ${resumen.inactivos} inactivos`
                    : `${resumen.inactivos} inactivos`
                }
                icono={FiBox}
              />
            </div>

            {/* Ventas por día + estado de pedidos */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <Tarjeta
                className="lg:col-span-2"
                titulo="Ventas por día"
                subtitulo={`Últimos ${DIAS_GRAFICA} días · ${formatoCOP(resumen.ventasPeriodo)} en total`}
              >
                {resumen.ventasPeriodo === 0 ? (
                  <p className="flex flex-1 items-center justify-center rounded-2xl bg-slate-50 p-10 text-center text-sm text-slate-500">
                    No hubo ventas en los últimos {DIAS_GRAFICA} días.
                  </p>
                ) : (
                  <GraficaColumnas
                    datos={resumen.serieDias}
                    formatoValor={formatoCOP}
                    formatoEje={formatoCOPCompacto}
                    describirExtra={(d) => `${d.cantidad} ${d.cantidad === 1 ? "venta" : "ventas"}`}
                  />
                )}
                <VerDatos
                  columnas={["Día", "Ventas", "Total"]}
                  filas={resumen.serieDias.map((d) => [d.etiquetaLarga, d.cantidad, formatoCOP(d.valor)])}
                />
              </Tarjeta>

              <Tarjeta titulo="Estado de los pedidos" subtitulo={`${ventas.length} pedidos en total`}>
                <BarraSegmentada partes={resumen.estados} />
              </Tarjeta>
            </div>

            {/* Usuarios, categorías y stock bajo */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <Tarjeta titulo="Usuarios por rol" subtitulo={`${usuarios.length} usuarios registrados`}>
                <BarraSegmentada partes={resumen.roles} />
              </Tarjeta>

              <Tarjeta titulo="Productos por categoría" subtitulo="Solo productos activos">
                <BarrasHorizontales
                  datos={resumen.categorias}
                  formatoValor={(v) => `${v} ${v === 1 ? "producto" : "productos"}`}
                />
              </Tarjeta>

              <Tarjeta
                titulo="Stock bajo"
                subtitulo="Productos activos con menos de 5 unidades"
                acciones={
                  <Link to="/admin-productos" className="text-sm font-bold text-[#14432F] hover:underline">
                    Ver productos
                  </Link>
                }
              >
                {resumen.stockBajo.length === 0 ? (
                  <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
                    <FiCheckCircle className="h-5 w-5 shrink-0" />
                    Todos los productos tienen stock suficiente.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {resumen.stockBajo.slice(0, 6).map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                        <span className="truncate text-sm font-medium text-slate-700">{p.nombre}</span>
                        <span
                          className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                            p.stock <= 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"
                          }`}
                        >
                          {p.stock <= 0 ? <FiXCircle className="h-3.5 w-3.5" /> : <FiAlertTriangle className="h-3.5 w-3.5" />}
                          {p.stock <= 0 ? "Agotado" : `${p.stock} unid.`}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Tarjeta>
            </div>

            {/* Últimos registros */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 p-6">
                <h3 className="text-lg font-bold text-slate-900">Últimos registros</h3>
                <Link to="/admin-users" className="text-sm font-bold text-[#14432F] hover:underline">
                  Ver todos
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-6 py-4 text-[11px] font-extrabold uppercase text-slate-400">Usuario</th>
                      <th className="px-6 py-4 text-[11px] font-extrabold uppercase text-slate-400">Rol</th>
                      <th className="px-6 py-4 text-right text-[11px] font-extrabold uppercase text-slate-400">Registro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resumen.ultimosUsuarios.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-10 text-center text-sm text-slate-500">
                          Aún no hay usuarios registrados.
                        </td>
                      </tr>
                    ) : (
                      resumen.ultimosUsuarios.map((u) => (
                        <tr key={u.id} className="transition-colors hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold capitalize text-slate-900">
                                {u.nombres} {u.apellidos !== u.nombres ? u.apellidos : ""}
                              </span>
                              <span className="text-xs text-slate-400">{u.correo}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-600">
                            {ROL_SINGULAR[Number(u.rol_id)] || "Cliente"}
                          </td>
                          <td className="px-6 py-4 text-right text-xs font-bold text-slate-400">
                            {u.fecha_creacion
                              ? fechaCorta(u.fecha_creacion.slice(0, 10), { day: "numeric", month: "short", year: "numeric" })
                              : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
