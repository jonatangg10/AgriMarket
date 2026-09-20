import { useState, useEffect } from "react";
import { ArrowLeftIcon, UserPlusIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

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
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8 max-w-3xl mx-auto">
            {/* Botón Volver */}
            <button
                onClick={onCancel}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold mb-6 transition-colors"
            >
                <ArrowLeftIcon className="h-4 w-4" />
                Volver a la lista
            </button>

            {/* Título */}
            <div className="flex items-center gap-3 mb-8">
                {isEditing ? (
                    <PencilSquareIcon className="h-7 w-7 text-blue-600" />
                ) : (
                    <UserPlusIcon className="h-7 w-7 text-blue-600" />
                )}
                <h2 className="text-2xl font-black text-slate-900">
                    {isEditing ? "Editar Usuario" : "Registrar Nuevo Usuario"}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombres */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                            Nombres
                        </label>
                        <input
                            type="text"
                            name="nombres"
                            required
                            value={formData.nombres}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                        />
                    </div>

                    {/* Apellidos */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                            Apellidos
                        </label>
                        <input
                            type="text"
                            name="apellidos"
                            required
                            value={formData.apellidos}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                        />
                    </div>

                    {/* Documento */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                            N° Documento
                        </label>
                        <input
                            type="text"
                            name="num_documento"
                            disabled={isEditing}
                            value={formData.num_documento}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            name="correo"
                            required
                            value={formData.correo}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                        />
                    </div>

                    {/* Contraseña */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                            Contraseña {isEditing && "(dejar en blanco para no cambiar)"}
                        </label>
                        <input
                            type="password"
                            name="password"
                            required={!isEditing}
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                        />
                    </div>

                    {/* Rol */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                            Rol
                        </label>
                        <select
                            name="rol_id"
                            value={formData.rol_id}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                        >
                            <option value={1}>Administrador</option>
                            <option value={2}>Usuario Cliente</option>
                        </select>
                    </div>
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
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20"
                    >
                        {isEditing ? "Guardar Cambios" : "Crear Usuario"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserForm;