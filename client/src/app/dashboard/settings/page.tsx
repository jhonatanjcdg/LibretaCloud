
"use client";

import { fetchAPI } from "@/lib/api";
import { motion } from "framer-motion";
import { Building2, ChevronRight, CreditCard, Globe, Hash, Image as ImageIcon, Mail, MapPin, Percent, Phone, Save } from "lucide-react";
import { useEffect, useState } from "react";

export default function SettingsPage() {
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const [processingPayment, setProcessingPayment] = useState(false);

    useEffect(() => {
        loadCompany();

        // Handle payment redirects
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const paymentStatus = urlParams.get('payment');
            if (paymentStatus === 'success') {
                setMessage({ type: 'success', text: '¡Pago procesado exitosamente! Tu suscripción LibretaCloud Pro está activa.' });
            } else if (paymentStatus === 'failure') {
                setMessage({ type: 'error', text: 'Hubo un error al procesar tu pago. Por favor intenta nuevamente.' });
            } else if (paymentStatus === 'pending') {
                setMessage({ type: 'success', text: 'Tu pago está pendiente de aprobación. Se activará pronto.' });
            }

            // Limpia la URL
            if (paymentStatus) {
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }, []);

    const loadCompany = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.companyId) {
                const data = await fetchAPI(`/companies/${user.companyId}`);
                setCompany(data);
            }
        } catch (error) {
            console.error("Error loading company", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async () => {
        setProcessingPayment(true);
        try {
            const data = await fetchAPI('/subscriptions/create-preference', { method: 'POST' });
            if (data.init_point) {
                window.location.href = data.init_point;
            } else {
                setMessage({ type: 'error', text: 'Error al iniciar el proceso de pago.' });
                setProcessingPayment(false);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error de conexión con Mercado Pago.' });
            setProcessingPayment(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: "", text: "" });

        try {
            await fetchAPI(`/companies/${company.id}`, {
                method: 'PATCH',
                body: JSON.stringify(company)
            });
            setMessage({ type: "success", text: "Configuración guardada correctamente" });
        } catch (error) {
            setMessage({ type: "error", text: "Error al guardar la configuración" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!company) return <div className="p-8 text-gray-400">No se encontró información de la empresa.</div>;

    return (
        <div className="p-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Configuración</h1>
                <p className="text-gray-400">Gestiona los datos legales y de contacto de tu empresa</p>
            </div>

            {message.text && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'
                        }`}
                >
                    {message.text}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold">Información Legal</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Nombre de la Empresa</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
                                    value={company.name || ""}
                                    onChange={e => setCompany({ ...company, name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Logo URL</label>
                            <div className="relative">
                                <ImageIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="https://ejemplo.com/logo.png"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
                                    value={company.logoUrl || ""}
                                    onChange={e => setCompany({ ...company, logoUrl: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">NIT / Identificación Fiscal</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
                                    value={company.nit || ""}
                                    onChange={e => setCompany({ ...company, nit: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Dirección Física</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
                                    value={company.address || ""}
                                    onChange={e => setCompany({ ...company, address: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subscriptions Section */}
                <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-8 space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Plan y Suscripción</h2>
                            <p className="text-indigo-200/60 text-sm">Aumenta los límites y automatiza tu negocio</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                            <p className="text-sm text-gray-400 mb-1">Estado actual</p>
                            <p className="text-2xl font-bold flex items-center gap-2">
                                {company.subscriptionStatus === 'ACTIVE' ? (
                                    <span className="text-green-400">Pro Activo</span>
                                ) : (
                                    <span className="text-yellow-400">Plan de Prueba</span>
                                )}
                            </p>
                            {company.subscriptionEndDate && (
                                <p className="text-xs text-gray-500 mt-2">
                                    Válido hasta: {new Date(company.subscriptionEndDate).toLocaleDateString()}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col justify-center items-start md:items-end">
                            {company.subscriptionStatus !== 'ACTIVE' && (
                                <button
                                    type="button"
                                    onClick={handleSubscribe}
                                    disabled={processingPayment}
                                    className="flex items-center gap-2 bg-[#009EE3] hover:bg-[#008ACB] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#009EE3]/20 disabled:opacity-50"
                                >
                                    {processingPayment ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            Mejorar a Pro
                                            <ChevronRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            )}
                            {company.subscriptionStatus !== 'ACTIVE' && (
                                <p className="text-xs text-gray-500 mt-3 text-right">
                                    Pagos seguros por Mercado Pago. <br /> $25.000 COP / mes.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                            <Phone className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold">Contacto y Facturación</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Teléfono</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
                                    value={company.phone || ""}
                                    onChange={e => setCompany({ ...company, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Email de Contacto</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
                                    value={company.email || ""}
                                    onChange={e => setCompany({ ...company, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Sitio Web</label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
                                    value={company.website || ""}
                                    onChange={e => setCompany({ ...company, website: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">IVA por defecto (%)</label>
                            <div className="relative">
                                <Percent className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
                                    value={company.defaultTaxRate || 19}
                                    onChange={e => setCompany({ ...company, defaultTaxRate: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        Guardar Configuración
                    </button>
                </div>
            </form>
        </div>
    );
}
