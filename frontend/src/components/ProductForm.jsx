import { useState, useEffect, useContext, useMemo } from "react";
import { ArrowLeftIcon, CubeIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { UserContext } from "../context/UserContext";

const ProductForm = ({ producto, onSave, onCancel }) => {
    const isEditing = Boolean(producto?.id);
    const { obtenerUsuariosPorRol } = useContext(UserContext);
    const [vendedores, setVendedores] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [municipios, setMunicipios] = useState([]);
    const [preview, setPreview] = useState(
        producto?.imagen && producto.imagen.startsWith('/uploads')
            ? `https://agrimarket-yfbo.onrender.com${producto.imagen}`
            : producto?.imagen || null
    );
    const municipiosFiltrados = useMemo(() => {
        if (!formData.departamento_code) return [];
        return municipios.filter(
            (m) => m.departamento_code === formData.departamento_code
        );
    }, [formData.departamento_code, municipios]);

    const [formData, setFormData] = useState({
        nombre: "",
        precio: "",
        stock: 10,
        etiqueta: "",
        categoria: "",
        imagen: "",
        estado_id: 1,
        usuario_id: "",
        municipio_code: "",
        departamento_code: "",
    });

    useEffect(() => {
        const cargarVendedores = async () => {
            const data = await obtenerUsuariosPorRol(3); // 3 es el rol de Vendedor
            setVendedores(data);
        };
        cargarVendedores();
        Promise.all([
            fetch('https://agrimarket-yfbo.onrender.com/api/departamentos').then((res) => res.json()),
            fetch('https://agrimarket-yfbo.onrender.com/api/municipios').then((res) => res.json())
        ])
            .then(([deps, munis]) => {
                setDepartamentos(deps);
                setMunicipios(munis);
            })
            .catch((err) => console.error('Error cargando ubicación:', err));
    }, []);

    useEffect(() => {
        if (isEditing) {
            setFormData({
                nombre: producto.nombre || "",
                precio: producto.precio || "",
                stock: producto.stock !== undefined ? producto.stock : 10,
                etiqueta: producto.etiqueta || "",
                categoria: producto.categoria || "",
                imagen: producto.imagen || "",
                estado_id: producto.estado_id || 1,
                usuario_id: producto.usuario_id || "",
                municipio_code: producto.municipio_code || "",
                departamento_code: producto.departamento_code || "",
                imagenExistente: producto.imagen || "", // Guardamos la url vieja por si no sube foto nueva
            });
        }
    }, [producto, isEditing]);



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
            ...(isEditing && { id: producto.id }),
            ...formData,
            precio: parseFloat(formData.precio),
            stock: parseInt(formData.stock, 10),
            estado_id: parseInt(formData.estado_id, 10),
            usuario_id: parseInt(formData.usuario_id, 10)
        });
    };

    return (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8 max-w-3xl mx-auto">
            <button
                type="button"
                onClick={onCancel}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold mb-6 transition-colors"
            >
                <ArrowLeftIcon className="h-4 w-4" />
                Volver a la lista
            </button>

            <div className="flex items-center gap-3 mb-8">
                {isEditing ? (
                    <PencilSquareIcon className="h-7 w-7 text-[#14432F]" />
                ) : (
                    <CubeIcon className="h-7 w-7 text-[#14432F]" />
                )}
                <h2 className="text-2xl font-black text-slate-900">
                    {isEditing ? "Editar Producto" : "Registrar Nuevo Producto"}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Nombre del Producto</label>
                        <input
                            type="text"
                            name="nombre"
                            required
                            value={formData.nombre}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Categoría</label>
                        <input
                            type="text"
                            name="categoria"
                            required
                            value={formData.categoria}
                            onChange={handleChange}
                            placeholder="Ej: Frutas, Hortalizas..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                        />
                    </div>

                    {/* Vendedor / Usuario */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                            Asignar a Vendedor (Usuario ID)
                        </label>
                        <select name="usuario_id" value={formData.usuario_id} onChange={handleChange} required>
                            <option value="">Selecciona un vendedor...</option>
                            {vendedores.map(vend => (
                                <option key={vend.id} value={vend.id}>
                                    {vend.nombres} {vend.apellidos}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Precio</label>
                        <input
                            type="number"
                            name="precio"
                            step="0.01"
                            min="0"
                            required
                            value={formData.precio}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Stock Disponible</label>
                        <input
                            type="number"
                            name="stock"
                            min="0"
                            required
                            value={formData.stock}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                        />
                    </div>


                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Etiqueta</label>
                        <input
                            type="text"
                            name="etiqueta"
                            required
                            value={formData.etiqueta}
                            onChange={handleChange}
                            placeholder="Ej: Fresco, Oferta, Nuevo"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                        />
                    </div>

                    {/* Departamento */}
                    <div>
                        <label
                            htmlFor="departamento_code"
                            className="block text-xs font-bold uppercase text-slate-500 mb-2"
                        >
                            Departamentos
                        </label>

                        <select
                            id="departamento_code"
                            name="departamento_code"
                            value={formData.departamento_code}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                            required={true}
                        >
                            <option value="">-- Selecciona un departamento --</option>
                            {departamentos.map((departamento) => (
                                <option key={departamento.code} value={departamento.code}>
                                    {departamento.nombre}
                                </option>
                            ))}

                        </select>
                    </div>


                    {/* Municipio */}
                    <div>
                        <label
                            htmlFor="municipio_code"
                            className="block text-xs font-bold uppercase text-slate-500 mb-2"
                        >
                            Municipio
                        </label>

                        <select
                            id="municipio_code"
                            name="municipio_code"
                            value={formData.municipio_code}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                            disabled={!formData.departamento_code}
                            required={true}
                        >
                            <option value="">-- Selecciona un municipio --</option>
                            {municipiosFiltrados.toSorted((a, b) => a.nombre.localeCompare(b.nombre)).map((municipality) => (
                                <option key={municipality.code} value={municipality.code}>
                                    {municipality.nombre}
                                </option>
                            ))}

                        </select>
                    </div>


                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Estado</label>
                        <select
                            name="estado_id"
                            value={formData.estado_id}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                        >
                            <option value={1}>Activo / Disponible</option>
                            <option value={2}>Inactivo / Oculto</option>
                        </select>
                    </div>

                    {/* INPUT DE IMAGEN */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Imagen del Producto</label>
                        <input
                            type="file"
                            accept="image/*"
                            name="imagen"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    // guardamos el archivo para enviarlo
                                    setFormData(prev => ({ ...prev, imagen: file }));
                                    // guardamos vista previa temporal
                                    setPreview(URL.createObjectURL(file));
                                }
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
                        />
                        {/* esto namas pa preview */}
                        {preview && (
                            <div className="mt-4">
                                <p className="text-xs text-slate-500 mb-2">Vista previa:</p>
                                <img src={preview} alt="Vista previa" className="h-32 w-32 object-cover rounded-xl border border-slate-200 shadow-sm" />
                            </div>
                        )}
                    </div>
                </div>

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
                        className="px-6 py-3 bg-[#14432F] hover:bg-blue-500 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20"
                    >
                        {isEditing ? "Guardar Cambios" : "Crear Producto"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;