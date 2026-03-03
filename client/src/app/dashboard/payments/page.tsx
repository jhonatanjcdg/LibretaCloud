
"use client";

import { fetchAPI } from "@/lib/api";
import {
    ArrowUpRight,
    Calendar,
    DollarSign,
    FileText,
    Filter,
    Search
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function GlobalPaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const data = await fetchAPI(`/payments?companyId=${user.companyId}`);
            setPayments(data);
        } catch (error) {
            console.error("Error loading payments", error);
        } finally {
            setLoading(false);
        }
    };

    const getMethodColor = (method: string) => {
        const colors: any = {
            CASH: "bg-emerald-500/10 text-emerald-400",
            TRANSFER: "bg-blue-500/10 text-blue-400",
            CARD: "bg-purple-500/10 text-purple-400",
            CHECK: "bg-orange-500/10 text-orange-400",
            OTHER: "bg-gray-500/10 text-gray-400",
        };
        return colors[method] || colors.OTHER;
    };

    const filteredPayments = payments.filter((p: any) =>
        p.invoice?.number?.toString().includes(searchTerm) ||
        p.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.method.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalCollected = filteredPayments.reduce((sum, p: any) => sum + Number(p.amount), 0);

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Historial de Pagos</h1>
                    <p className="text-gray-400">Registro global de ingresos y recaudos</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <DollarSign className="w-12 h-12" />
                    </div>
                    <p className="text-gray-400 text-sm mb-1">Total Recaudado (Filtrado)</p>
                    <p className="text-3xl font-bold text-green-400">${totalCollected.toFixed(2)}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <p className="text-gray-400 text-sm mb-1">Transacciones</p>
                    <p className="text-3xl font-bold">{filteredPayments.length}</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar por # factura, nota o método..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-green-500 transition-colors"
                    />
                </div>
                <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors">
                    <Filter className="w-5 h-5" /> Filtrar
                </button>
            </div>

            {/* Payments Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            <th className="px-6 py-4 text-sm font-bold text-gray-400 uppercase">Fecha</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-400 uppercase">Factura</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-400 uppercase">Método</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-400 uppercase">Monto</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-400 uppercase">Notas</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-400 uppercase text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={6} className="px-6 py-4 bg-white/5 h-12"></td>
                                </tr>
                            ))
                        ) : filteredPayments.map((payment: any) => (
                            <tr key={payment.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        {new Date(payment.date).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <Link href={`/dashboard/invoices/${payment.invoiceId}`} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                                        <FileText className="w-4 h-4" />
                                        #{payment.invoice?.number}
                                    </Link>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getMethodColor(payment.method)}`}>
                                        {payment.method}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-bold text-green-400">
                                        +${Number(payment.amount).toFixed(2)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-400 italic">
                                    {payment.note || '-'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link href={`/dashboard/invoices/${payment.invoiceId}`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && filteredPayments.length === 0 && (
                    <div className="p-20 text-center text-gray-500">
                        No se encontraron pagos registrados.
                    </div>
                )}
            </div>
        </div>
    );
}
