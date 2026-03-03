
"use client";

import { fetchAPI } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowDownCircle,
    ArrowUpCircle,
    Calendar,
    Filter,
    History,
    Package,
    Plus,
    Search,
    Settings2
} from "lucide-react";
import { useEffect, useState } from "react";

export default function InventoryPage() {
    const [movements, setMovements] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        productId: "",
        quantity: 0,
        type: "IN",
        reason: ""
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const [movementsData, productsData] = await Promise.all([
                fetchAPI(`/stock-movements?companyId=${user.companyId}`),
                fetchAPI('/products')
            ]);
            setMovements(movementsData);
            setProducts(productsData);
        } catch (error) {
            console.error("Error loading inventory data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        try {
            await fetchAPI('/stock-movements', {
                method: 'POST',
                body: JSON.stringify({
                    ...formData,
                    companyId: user.companyId,
                    quantity: Number(formData.quantity)
                })
            });
            setIsModalOpen(false);
            setFormData({ productId: "", quantity: 0, type: "IN", reason: "" });
            loadInitialData();
        } catch (error) {
            alert("Error: " + error);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'IN': return <ArrowUpCircle className="text-green-400 w-5 h-5" />;
            case 'OUT': return <ArrowDownCircle className="text-red-400 w-5 h-5" />;
            case 'ADJUSTMENT': return <Settings2 className="text-blue-400 w-5 h-5" />;
            default: return null;
        }
    };

    const getTypeText = (type: string) => {
        switch (type) {
            case 'IN': return 'Entrada';
            case 'OUT': return 'Salida';
            case 'ADJUSTMENT': return 'Ajuste';
            default: return type;
        }
    };

    const filteredMovements = movements.filter((m: any) =>
        m.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.reason?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Trazabilidad de Inventario</h1>
                    <p className="text-gray-400">Historial completo de movimientos de stock</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                    <Plus className="w-5 h-5" /> Ajuste Manual
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <History className="w-12 h-12" />
                    </div>
                    <p className="text-gray-400 text-sm mb-1">Total Movimientos</p>
                    <p className="text-2xl font-bold">{movements.length}</p>
                </div>
                {/* Add more summary cards if needed */}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar por producto o motivo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                </div>
                <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors">
                    <Filter className="w-5 h-5" /> Filtrar
                </button>
            </div>

            {/* Movemenets Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            <th className="px-6 py-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Producto</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Tipo</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Cantidad</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Motivo</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={5} className="px-6 py-4 bg-white/5 h-12"></td>
                                </tr>
                            ))
                        ) : filteredMovements.map((movement: any) => (
                            <tr key={movement.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm">
                                            {new Date(movement.date).toLocaleDateString()} {new Date(movement.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-indigo-500/10 rounded flex items-center justify-center text-indigo-400">
                                            <Package className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{movement.product?.name}</p>
                                            <p className="text-xs text-gray-500">SKU: {movement.product?.sku}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {getTypeIcon(movement.type)}
                                        <span className={`text-sm font-medium ${movement.type === 'IN' ? 'text-green-400' :
                                                movement.type === 'OUT' ? 'text-red-400' : 'text-blue-400'
                                            }`}>
                                            {getTypeText(movement.type)}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-sm font-bold ${movement.type === 'IN' ? 'bg-green-500/10 text-green-400' :
                                            movement.type === 'OUT' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                                        }`}>
                                        {movement.type === 'OUT' ? '-' : '+'}{movement.quantity}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-400">
                                    {movement.reason || '-'}
                                    {movement.invoice && (
                                        <a href={`/dashboard/invoices/${movement.invoice.id}`} className="block text-xs text-indigo-400 hover:text-indigo-300 mt-1">
                                            Ver Factura #{movement.invoice.number}
                                        </a>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && filteredMovements.length === 0 && (
                    <div className="p-20 text-center text-gray-500">
                        No se encontraron movimientos.
                    </div>
                )}
            </div>

            {/* Manual Adjustment Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#111] border border-white/10 w-full max-w-lg rounded-3xl p-8 shadow-2xl overflow-hidden relative"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />
                            <h2 className="text-2xl font-bold mb-6">Ajuste de Inventario</h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Producto</label>
                                    <select
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                                        value={formData.productId}
                                        onChange={e => setFormData({ ...formData, productId: e.target.value })}
                                    >
                                        <option value="" className="bg-black">Seleccionar producto...</option>
                                        {products.map((p: any) => (
                                            <option key={p.id} value={p.id} className="bg-black">{p.name} (Stock: {p.stock})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Tipo</label>
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="IN" className="bg-black">Entrada</option>
                                            <option value="OUT" className="bg-black">Salida</option>
                                            <option value="ADJUSTMENT" className="bg-black">Ajuste</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Cantidad</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                                            value={formData.quantity}
                                            onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Motivo / Notas</label>
                                    <textarea
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors min-h-[100px]"
                                        placeholder="Ej: Ajuste por inventario físico, producto dañado..."
                                        value={formData.reason}
                                        onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-3.5 font-bold hover:bg-white/5 rounded-xl transition-colors border border-white/5"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                                    >
                                        Registrar
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
