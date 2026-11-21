const ROLES = {
  1: { label: "Administrador", clase: "text-purple-700 bg-purple-100" },
  2: { label: "Cliente", clase: "text-blue-700 bg-blue-100" },
  3: { label: "Agricultor Aliado", clase: "text-emerald-700 bg-emerald-100" },
};

/**
 * Tarjeta del usuario logueado (encima de "Cerrar Sesión").
 * Muestra iniciales, nombre, rol legible y correo.
 */
const UserCard = ({ usuario }) => {
  const nombre = usuario?.nombres?.split(" ")[0] || "";
  const apellido = usuario?.apellidos?.split(" ")[0] || "";

  // Evita mostrar "admin admin" cuando nombre y apellido son iguales
  const nombreCompleto =
    nombre.toLowerCase() === apellido.toLowerCase()
      ? nombre
      : `${nombre} ${apellido}`.trim();

  const iniciales =
    nombre.toLowerCase() === apellido.toLowerCase()
      ? nombre.slice(0, 2)
      : `${nombre.charAt(0)}${apellido.charAt(0)}`;

  const rol = ROLES[Number(usuario?.rol)] || ROLES[2];

  return (
    <div className="bg-slate-100 rounded-2xl p-3 flex items-center gap-3">
      <div className="h-10 w-10 shrink-0 rounded-full bg-[#14432F] text-white flex items-center justify-center text-sm font-black uppercase">
        {iniciales || "?"}
      </div>

      <div className="min-w-0">
        <h4 className="text-sm font-bold text-slate-800 truncate capitalize">
          {nombreCompleto || "Usuario"}
        </h4>

        <span
          className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${rol.clase}`}
        >
          {rol.label}
        </span>

        {usuario?.correo && (
          <p className="text-[11px] text-slate-500 mt-1 truncate" title={usuario.correo}>
            {usuario.correo}
          </p>
        )}
      </div>
    </div>
  );
};

export default UserCard;
