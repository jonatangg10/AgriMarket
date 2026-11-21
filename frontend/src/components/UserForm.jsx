import { useState, useEffect } from "react";
import { ArrowLeftIcon, UserPlusIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

const inputClase =
    "w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#14432F] focus:ring-4 focus:ring-[#14432F]/10 transition-all disabled:cursor-not-allowed disabled:opacity-60";

const Campo = ({ etiqueta, htmlFor, children }) => (
    <div>
        <label htmlFor={htmlFor} className="block text-xs font-bold uppercase text-slate-500 mb-2">
            {etiqueta}
        </label>
        {children}
    </div>
);

const UserForm = ({ usuario, onSave, onCancel }) => {
    const isEditing = Boolean(usuario?.id);

    const [formData, setFormData] = useState({
        nombres: "",
        apellidos: "",
        num_documento: "",
        correo: "",
        password: "",
        genero_id: 1,
        rol_id: 2,
    });

    useEffect(() => {
        if (isEditing) {
            setFormData({
                nombres: usuario.nombres || "",
                apellidos: usuario.apellidos || "",
                num_documento: usuario.num_documento || "",
                correo: usuario.correo || "",
                password: "", // Contraseña vacía por defecto al editar
                genero_id: usuario.genero_id || 1,
                rol_id: usuario.rol_id || 2,
            });
        }
    }, [usuario, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...(isEditing && { id: usuario.id }),
            ...formData,
            rol_id: Number(formData.rol_id),
            genero_id: Number(formData.genero_id)
        });
    };

    return (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-5 sm:p-8 w-full">
            {/* Botón Volver */}
            <button
                type="button"
                onClick={onCancel}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold mb-6 transition-colors"
            >
                <ArrowLeftIcon className="h-4 w-4" />
                Volver a la lista
            </button>

            {/* Título */}
            <div className="flex items-center gap-3 mb-8">
                {isEditing ? (
                    <PencilSquareIcon className="h-7 w-7 text-[#14432F]" />
                ) : (
                    <UserPlusIcon className="h-7 w-7 text-[#14432F]" />
                )}
                <h2 className="text-2xl font-black text-slate-900">
                    {isEditing ? "Editar Usuario" : "Registrar Nuevo Usuario"}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* En PC de a 2 columnas: Nombres | Apellidos · Rol | Documento · Correo | Contraseña · Género */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Campo etiqueta="Nombres" htmlFor="nombres">
                        <input
                            id="nombres"
                            type="text"
                            name="nombres"
                            required
                            value={formData.nombres}
                            onChange={handleChange}
                            className={inputClase}
                        />
                    </Campo>

                    <Campo etiqueta="Apellidos" htmlFor="apellidos">
                        <input
                            id="apellidos"
                            type="text"
                            name="apellidos"
                            required
                            value={formData.apellidos}
                            onChange={handleChange}
                            className={inputClase}
                        />
                    </Campo>

                    <Campo etiqueta="Rol" htmlFor="rol_id">
                        <select
                            id="rol_id"
                            name="rol_id"
                            value={formData.rol_id}
                            onChange={handleChange}
                            className={inputClase}
                        >
                            <option value={1}>Administrador</option>
                            <option value={2}>Cliente</option>
                            <option value={3}>Vendedor / Agricultor</option>
                        </select>
                    </Campo>

                    <Campo etiqueta="N° Documento" htmlFor="num_documento">
                        <input
                            id="num_documento"
                            type="text"
                            inputMode="numeric"
                            name="num_documento"
                            required={!isEditing}
                            disabled={isEditing}
                            value={formData.num_documento}
                            onChange={handleChange}
                            className={inputClase}
                        />
                    </Campo>

                    <Campo etiqueta="Correo Electrónico" htmlFor="correo">
                        <input
                            id="correo"
                            type="email"
                            name="correo"
                            required
                            value={formData.correo}
                            onChange={handleChange}
                            className={inputClase}
                        />
                    </Campo>

                    <Campo
                        etiqueta={`Contraseña${isEditing ? " (dejar en blanco para no cambiar)" : ""}`}
                        htmlFor="password"
                    >
                        <input
                            id="password"
                            type="password"
                            name="password"
                            required={!isEditing}
                            value={formData.password}
                            onChange={handleChange}
                            className={inputClase}
                        />
                    </Campo>

                    <Campo etiqueta="Género" htmlFor="genero_id">
                        <select
                            id="genero_id"
                            name="genero_id"
                            value={formData.genero_id}
                            onChange={handleChange}
                            className={inputClase}
                        >
                            <option value={1}>Masculino</option>
                            <option value={2}>Femenino</option>
                        </select>
                    </Campo>
                </div>

                {/* Acciones */}
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-[#14432F] hover:bg-[#0E3323] text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-green-900/20"
                    >
                        {isEditing ? "Guardar Cambios" : "Crear Usuario"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserForm;
