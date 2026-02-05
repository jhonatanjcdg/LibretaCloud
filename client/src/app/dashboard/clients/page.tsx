
"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import { Plus, User, Mail, Phone, MapPin, Edit2, Trash2, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function ClientsPage() {
    const [clients, setClients] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        nit: "",
        email: "",
        phone: "",
        address: "",
    });

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const data = await fetchAPI('/clients');
            setClients(data);
        } catch (error) {
            console.error("Error loading clients", error);
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        try {
            const url = editingClient ? `/clients/${editingClient.id}` : '/clients';
            const method = editingClient ? 'PATCH' : 'POST';

            await fetchAPI(url, {
                method,
                body: JSON.stringify({
                    ...formData,
                    companyId: user.companyId
                })
            });
            setIsModalOpen(false);
            setEditingClient(null);
            loadClients();
        } catch (error) {
            alert("Error: " + error);
        }
    };

    const handleEdit = (client: any) => {
        setEditingClient(client);
        setFormData({
            name: client.name,
            nit: client.nit || "",
            email: client.email || "",
            phone: client.phone || "",
            address: client.address || "",
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este cliente?")) return;
        try {
            await fetchAPI(`/clients/${id}`, { method: 'DELETE' });
            loadClients();
        } catch (error) {
            alert("Error al eliminar: " + error);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Clientes</h1>
                    <p className="text-gray-400">Directorio de contactos y empresas</p>
                </div>
                <button
                    onClick={() => {
                        setEditingClient(null);
                        setFormData({ name: "", nit: "", email: "", phone: "", address: "" });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-purple-500/20"
                >
                    <Plus className="w-5 h-5" /> Nuevo Cliente
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Buscar por nombre, NIT o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-purple-500 outline-none transition-colors"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients
                    .filter((client: any) =>
                        (client.name || "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (client.nit || "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (client.email || "").toString().toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((client: any) => (
                        <motion.div
                            key={client.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-purple-500/30 transition-colors"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{client.name}</h3>
                                        <p className="text-sm text-gray-500">NIT: {client.nit || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEdit(client)}
                                        className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(client.id)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm text-gray-400">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-gray-600" />
                                    <span>{client.email || "No email"}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-gray-600" />
                                    <span>{client.phone || "No teléfono"}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-gray-600" />
                                    <span>{client.address || "No dirección"}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                {clients.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-500">
                        No hay clientes registrados aún.
                    </div>
                )}
            </div>

            {/* Simple Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#111] border border-white/10 w-full max-w-lg rounded-2xl p-6 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6">{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                placeholder="Nombre o Razón Social"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    placeholder="NIT / DNI"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    value={formData.nit}
                                    onChange={e => setFormData({ ...formData, nit: e.target.value })}
                                />
                                <input
                                    placeholder="Teléfono"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <input
                                placeholder="Email"
                                type="email"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                            <input
                                placeholder="Dirección Física"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
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
                                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-colors"
                                >
                                    Guardar Cliente
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
