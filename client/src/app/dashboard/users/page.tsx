
"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import { Plus, User, Mail, Shield, Trash2, Edit2, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "USER",
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const data = await fetchAPI(`/users?companyId=${user.companyId}`);
            setUsers(data);
        } catch (error) {
            console.error("Error loading users", error);
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

        try {
            const url = editingUser ? `/users/${editingUser.id}` : '/users';
            const method = editingUser ? 'PATCH' : 'POST';

            await fetchAPI(url, {
                method,
                body: JSON.stringify({
                    ...formData,
                    companyId: currentUser.companyId
                })
            });
            setIsModalOpen(false);
            setEditingUser(null);
            setFormData({ name: "", email: "", password: "", role: "USER" });
            loadUsers();
        } catch (error) {
            alert("Error: " + error);
        }
    };

    const handleEdit = (user: any) => {
        setEditingUser(user);
        setFormData({
            name: user.name || "",
            email: user.email,
            password: "", // Don't pre-fill password
            role: user.role,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (id === currentUser.id) {
            alert("No puedes eliminar tu propio usuario.");
            return;
        }

        if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) return;
        try {
            await fetchAPI(`/users/${id}`, { method: 'DELETE' });
            loadUsers();
        } catch (error) {
            alert("Error al eliminar: " + error);
        }
    };

    const getRoleBadge = (role: string) => {
        const colors: any = {
            ADMIN: "bg-red-500/20 text-red-400 border-red-500/20",
            USER: "bg-blue-500/20 text-blue-400 border-blue-500/20",
            ACCOUNTANT: "bg-green-500/20 text-green-400 border-green-500/20",
        };
        return colors[role] || colors.USER;
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Gestión de Usuarios</h1>
                    <p className="text-gray-400">Administra los accesos y roles de tu equipo</p>
                </div>
                <button
                    onClick={() => {
                        setEditingUser(null);
                        setFormData({ name: "", email: "", password: "", role: "USER" });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/20"
                >
                    <Plus className="w-5 h-5" /> Nuevo Usuario
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-indigo-500 outline-none transition-colors"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users
                    .filter((u: any) =>
                        (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((u: any) => (
                        <motion.div
                            key={u.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-indigo-500/30 transition-colors"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{u.name || "Sin nombre"}</h3>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getRoleBadge(u.role)}`}>
                                            {u.role}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(u)} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(u.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <Mail className="w-4 h-4 text-indigo-400/50" />
                                    {u.email}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <Shield className="w-4 h-4 text-indigo-400/50" />
                                    Creado el {new Date(u.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </motion.div>
                    ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-[#111] border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl"
                    >
                        <h2 className="text-2xl font-bold mb-6">{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            {!editingUser && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Contraseña</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Rol</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="USER" className="bg-[#111]">Usuario Estándar</option>
                                    <option value="ACCOUNTANT" className="bg-[#111]">Contador</option>
                                    <option value="ADMIN" className="bg-[#111]">Administrador</option>
                                </select>
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-gray-400 font-bold hover:bg-white/5 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-2 px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
                                >
                                    {editingUser ? "Guardar" : "Crear"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
