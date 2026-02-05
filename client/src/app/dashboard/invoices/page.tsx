
"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import { Plus, FileText, Calendar, DollarSign, Trash2, Edit2, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [clients, setClients] = useState([]);

    const [editingInvoice, setEditingInvoice] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");

    // Form State
    const [formData, setFormData] = useState({
        clientId: "",
        items: [{ productId: "", quantity: 1 }]
    });

    useEffect(() => {
        loadInvoices();
        loadProducts();
        loadClients();
    }, []);

    const loadInvoices = async () => {
        try {
            const data = await fetchAPI('/invoices');
            setInvoices(data);
        } catch (error) {
            console.error("Error loading invoices", error);
        }
    };

    const loadProducts = async () => {
        try {
            const data = await fetchAPI('/products');
            setProducts(data);
        } catch (error) { }
    };

    const loadClients = async () => {
        try {
            const data = await fetchAPI('/clients');
            setClients(data);
        } catch (error) { }
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { productId: "", quantity: 1 }]
        });
    };

    const removeItem = (index: number) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData({ ...formData, items: newItems });
    };
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        try {
            // Client-side stock check for better UX
            for (const item of formData.items) {
                const product: any = products.find((p: any) => p.id === item.productId);
                if (product && product.stock < item.quantity) {
                    alert(`Stock insuficiente para ${product.name}. Disponible: ${product.stock}`);
                    return;
                }
            }

            const url = editingInvoice ? `/invoices/${editingInvoice.id}` : '/invoices';
            const method = editingInvoice ? 'PATCH' : 'POST';

            await fetchAPI(url, {
                method,
                body: JSON.stringify({
                    ...formData,
                    companyId: user.companyId || "default-company-id",
                    status: editingInvoice ? editingInvoice.status : "DRAFT"
                })
            });
            setIsModalOpen(false);
            setEditingInvoice(null);
            setFormData({ clientId: "", items: [{ productId: "", quantity: 1 }] });
            loadInvoices();
        } catch (error) {
            alert("Error: " + error);
        }
    };

    const handleEdit = (invoice: any) => {
        setEditingInvoice(invoice);
        setFormData({
            clientId: invoice.clientId,
            items: invoice.items.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity
            }))
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar esta factura?")) return;
        try {
            await fetchAPI(`/invoices/${id}`, { method: 'DELETE' });
            loadInvoices();
        } catch (error) {
            alert("Error al eliminar: " + error);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: any = {
            DRAFT: "bg-gray-500/20 text-gray-400 border-gray-500/20",
            ISSUED: "bg-blue-500/20 text-blue-400 border-blue-500/20",
            PAID: "bg-green-500/20 text-green-400 border-green-500/20",
            CANCELLED: "bg-red-500/20 text-red-400 border-red-500/20",
        };
        return colors[status] || colors.DRAFT;
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Facturación</h1>
                    <p className="text-gray-400">Gestiona tus facturas electrónicas</p>
                </div>
                <button
                    onClick={() => {
                        setEditingInvoice(null);
                        setFormData({ clientId: "", items: [{ productId: "", quantity: 1 }] });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-green-500/20"
                >
                    <Plus className="w-5 h-5" /> Nueva Factura
                </button>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente o número de factura..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-green-500 outline-none transition-colors shadow-inner"
                    />
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 min-w-[200px]">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-transparent border-none outline-none text-gray-300 font-medium cursor-pointer w-full"
                    >
                        <option value="ALL" className="bg-[#111]">Todos los estados</option>
                        <option value="DRAFT" className="bg-[#111]">Borradores</option>
                        <option value="ISSUED" className="bg-[#111]">Emitidas</option>
                        <option value="PAID" className="bg-[#111]">Pagadas</option>
                        <option value="CANCELLED" className="bg-[#111]">Canceladas</option>
                    </select>
                </div>
            </div>

            {/* Invoices List */}
            <div className="space-y-4">
                {invoices
                    .filter((invoice: any) => {
                        const matchesSearch =
                            (invoice.client?.name || "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (invoice.number || "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (invoice.id || "").toString().toLowerCase().includes(searchTerm.toLowerCase());

                        const matchesStatus = filterStatus === "ALL" || invoice.status === filterStatus;

                        return matchesSearch && matchesStatus;
                    })
                    .map((invoice: any) => (
                        <motion.div
                            key={invoice.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-green-500/30 transition-colors flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-6 flex-1 cursor-pointer" onClick={() => window.location.href = `/dashboard/invoices/${invoice.id}`}>
                                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Factura #{invoice.number || invoice.id.slice(0, 8)}</h3>
                                    <p className="text-gray-400 text-sm">{invoice.client?.name || "Cliente desconocido"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-green-400">${Number(invoice.total).toFixed(2)}</p>
                                    <p className="text-xs text-gray-500">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-lg text-sm font-bold border ${getStatusColor(invoice.status)}`}>
                                    {invoice.status}
                                </span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEdit(invoice); }}
                                        className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(invoice.id); }}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                {invoices.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-500">
                        No hay facturas registradas aún.
                    </div>
                )}
            </div>

            {/* Invoice Creation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-[#111] border border-white/10 w-full max-w-2xl rounded-2xl p-6 my-8">
                        <h2 className="text-2xl font-bold mb-6">{editingInvoice ? 'Editar Factura' : 'Nueva Factura'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Cliente</label>
                                <select
                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                                    value={formData.clientId}
                                    onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                                    required
                                >
                                    <option value="" className="bg-[#1a1a1a] text-white">Seleccionar cliente...</option>
                                    {clients.map((client: any) => (
                                        <option key={client.id} value={client.id} className="bg-[#1a1a1a] text-white">{client.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-sm font-medium text-gray-400">Items de Factura</label>
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="text-sm text-green-400 hover:text-green-300"
                                    >
                                        + Agregar Item
                                    </button>
                                </div>

                                {formData.items.map((item, index) => (
                                    <div key={index} className="flex gap-3 mb-3">
                                        <select
                                            className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                                            value={item.productId}
                                            onChange={e => updateItem(index, 'productId', e.target.value)}
                                            required
                                        >
                                            <option value="" className="bg-[#1a1a1a] text-white">Seleccionar producto...</option>
                                            {products.map((product: any) => (
                                                <option key={product.id} value={product.id} className="bg-[#1a1a1a] text-white">
                                                    {product.name} - ${Number(product.price).toFixed(2)} (Stock: {product.stock})
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="Cant."
                                            className="w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            value={item.quantity}
                                            onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                                            required
                                        />
                                        {formData.items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="w-12 h-12 bg-red-500/10 hover:bg-red-500/20 rounded-xl flex items-center justify-center text-red-400"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
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
                                    className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-colors"
                                >
                                    {editingInvoice ? 'Guardar Cambios' : 'Crear Factura'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
