
"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import { Plus, Search, Archive, Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        stock: "",
        description: "",
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await fetchAPI('/products');
            setProducts(data);
        } catch (error) {
            console.error("Error loading products", error);
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        try {
            const url = editingProduct ? `/products/${editingProduct.id}` : '/products';
            const method = editingProduct ? 'PATCH' : 'POST';

            await fetchAPI(url, {
                method,
                body: JSON.stringify({
                    ...formData,
                    price: Number(formData.price),
                    stock: Number(formData.stock),
                    companyId: user.companyId // Ensure we send current user's company
                })
            });

            setIsModalOpen(false);
            setEditingProduct(null);
            loadProducts();
        } catch (error) {
            alert("Error: " + error);
        }
    };

    const handleEdit = (product: any) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price.toString(),
            stock: product.stock.toString(),
            description: product.description || "",
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;
        try {
            await fetchAPI(`/products/${id}`, { method: 'DELETE' });
            loadProducts();
        } catch (error) {
            alert("Error al eliminar: " + error);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Inventario</h1>
                    <p className="text-gray-400">Gestiona tus productos y servicios</p>
                </div>
                <button
                    onClick={() => {
                        setEditingProduct(null);
                        setFormData({ name: "", price: "", stock: "", description: "" });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/20"
                >
                    <Plus className="w-5 h-5" /> Nuevo Producto
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-indigo-500 outline-none transition-colors"
                />
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products
                    .filter((product: any) =>
                        (product.name || "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (product.description || "").toString().toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((product: any) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-indigo-500/30 transition-colors group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
                                    <Archive className="w-5 h-5" />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-1">{product.name}</h3>
                            <p className="text-2xl font-bold text-indigo-400 mb-2">${Number(product.price).toFixed(2)}</p>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description || "Sin descripción"}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="px-2 py-1 bg-white/5 rounded-md border border-white/5">Stock: {product.stock}</span>
                                <span className="px-2 py-1 bg-white/5 rounded-md border border-white/5">Ref: {product.id.slice(0, 5).toUpperCase()}</span>
                            </div>
                        </motion.div>
                    ))}
                {products.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-500">
                        No hay productos registrados aún.
                    </div>
                )}
            </div>

            {/* Simple Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#111] border border-white/10 w-full max-w-lg rounded-2xl p-6 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                placeholder="Nombre del producto"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Descripción"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    placeholder="Precio"
                                    type="number"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                                <input
                                    placeholder="Stock Inicial"
                                    type="number"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.stock}
                                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
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
