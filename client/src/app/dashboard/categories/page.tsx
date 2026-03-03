
"use client";

import { fetchAPI } from "@/lib/api";
import { motion } from "framer-motion";
import { Edit2, FolderOpen, Plus, Search, Tag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        name: "",
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const data = await fetchAPI(`/categories?companyId=${user.companyId}`);
            setCategories(data);
        } catch (error) {
            console.error("Error loading categories", error);
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        try {
            const url = editingCategory ? `/categories/${editingCategory.id}` : '/categories';
            const method = editingCategory ? 'PATCH' : 'POST';

            await fetchAPI(url, {
                method,
                body: JSON.stringify({
                    ...formData,
                    companyId: user.companyId
                })
            });

            setIsModalOpen(false);
            setEditingCategory(null);
            loadCategories();
        } catch (error) {
            alert("Error: " + error);
        }
    };

    const handleEdit = (category: any) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar esta categoría? Si hay productos asociados, asegúrate de moverlos primero.")) return;
        try {
            await fetchAPI(`/categories/${id}`, { method: 'DELETE' });
            loadCategories();
        } catch (error) {
            alert("Error al eliminar: " + error);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Categorías</h1>
                    <p className="text-gray-400">Organiza tus productos por grupos</p>
                </div>
                <button
                    onClick={() => {
                        setEditingCategory(null);
                        setFormData({ name: "" });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/20"
                >
                    <Plus className="w-5 h-5" /> Nueva Categoría
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Buscar categorías..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-indigo-500 outline-none transition-colors"
                />
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories
                    .filter((category: any) =>
                        (category.name || "").toString().toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((category: any) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-indigo-500/30 transition-colors group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400">
                                    <Tag className="w-5 h-5" />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <FolderOpen className="w-4 h-4" />
                                    {category._count?.products || 0} Productos
                                </span>
                            </div>
                        </motion.div>
                    ))}
                {categories.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-500">
                        No hay categorías registradas aún.
                    </div>
                )}
            </div>

            {/* Simple Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#111] border border-white/10 w-full max-w-lg rounded-2xl p-6 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6">{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                placeholder="Nombre de la categoría"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditingCategory(null);
                                    }}
                                    className="flex-1 py-3 font-bold hover:bg-white/5 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
