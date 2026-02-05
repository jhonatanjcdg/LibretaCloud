
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import { ArrowLeft, Download, Printer, Mail, CheckCircle, Send, XCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function InvoiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInvoice();
    }, [params.id]);

    const loadInvoice = async () => {
        try {
            const data = await fetchAPI(`/invoices/${params.id}`);
            setInvoice(data);
        } catch (error) {
            console.error("Error loading invoice", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        try {
            await fetchAPI(`/invoices/${params.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            });
            loadInvoice();
        } catch (error) {
            alert("Error updating status: " + error);
        }
    };

    const downloadPDF = () => {
        window.open(`http://localhost:4000/invoices/${params.id}/pdf`, '_blank');
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="p-8">
                <p className="text-gray-400">Factura no encontrada</p>
            </div>
        );
    }

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
        <div className="p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" /> Volver
                </button>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Factura #{invoice.number || invoice.id.slice(0, 8)}</h1>
                        <p className="text-gray-400">{new Date(invoice.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
                <button
                    onClick={downloadPDF}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-colors"
                >
                    <Download className="w-4 h-4" /> Descargar PDF
                </button>
                <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-colors">
                    <Printer className="w-4 h-4" /> Imprimir
                </button>
                <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-colors">
                    <Mail className="w-4 h-4" /> Enviar por Email
                </button>
                {invoice.status === 'DRAFT' && (
                    <button
                        onClick={() => updateStatus('ISSUED')}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors ml-auto"
                    >
                        <Send className="w-4 h-4" /> Emitir Factura
                    </button>
                )}
                {invoice.status === 'ISSUED' && (
                    <button
                        onClick={() => updateStatus('PAID')}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl transition-colors ml-auto"
                    >
                        <CheckCircle className="w-4 h-4" /> Marcar como Pagada
                    </button>
                )}
                {invoice.status !== 'CANCELLED' && invoice.status !== 'PAID' && (
                    <button
                        onClick={() => {
                            if (confirm("¿Estás seguro de que deseas cancelar esta factura?")) {
                                updateStatus('CANCELLED');
                            }
                        }}
                        className={`flex items-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 px-4 py-2 rounded-xl transition-colors ${['DRAFT', 'ISSUED'].includes(invoice.status) ? '' : 'ml-auto'}`}
                    >
                        <XCircle className="w-4 h-4" /> Cancelar
                    </button>
                )}
            </div>

            {/* Invoice Details */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-8"
            >
                {/* Company & Client Info */}
                <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-white/10">
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 mb-3">DE:</h3>
                        <p className="text-lg font-bold">{invoice.company?.name || "Tu Empresa"}</p>
                        <p className="text-gray-400 text-sm">NIT: {invoice.company?.nit || "N/A"}</p>
                        <p className="text-gray-400 text-sm">{invoice.company?.address || ""}</p>
                        <p className="text-gray-400 text-sm">{invoice.company?.email || ""}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 mb-3">PARA:</h3>
                        <p className="text-lg font-bold">{invoice.client?.name}</p>
                        <p className="text-gray-400 text-sm">NIT: {invoice.client?.nit || "N/A"}</p>
                        <p className="text-gray-400 text-sm">{invoice.client?.address || ""}</p>
                        <p className="text-gray-400 text-sm">{invoice.client?.email || ""}</p>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-3 text-sm font-bold text-gray-400">PRODUCTO/SERVICIO</th>
                                <th className="text-right py-3 text-sm font-bold text-gray-400">CANTIDAD</th>
                                <th className="text-right py-3 text-sm font-bold text-gray-400">PRECIO UNIT.</th>
                                <th className="text-right py-3 text-sm font-bold text-gray-400">IMPUESTO</th>
                                <th className="text-right py-3 text-sm font-bold text-gray-400">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items?.map((item: any) => (
                                <tr key={item.id} className="border-b border-white/5">
                                    <td className="py-4">
                                        <p className="font-medium">{item.product?.name || "Producto"}</p>
                                        <p className="text-sm text-gray-500">{item.product?.description || ""}</p>
                                    </td>
                                    <td className="text-right py-4">{item.quantity}</td>
                                    <td className="text-right py-4">${Number(item.price).toFixed(2)}</td>
                                    <td className="text-right py-4">${Number(item.tax).toFixed(2)}</td>
                                    <td className="text-right py-4 font-bold">${Number(item.total).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                    <div className="w-80 space-y-3">
                        <div className="flex justify-between text-gray-400">
                            <span>Subtotal:</span>
                            <span>${Number(invoice.subtotal).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                            <span>Impuestos:</span>
                            <span>${Number(invoice.tax).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-2xl font-bold pt-3 border-t border-white/10">
                            <span>TOTAL:</span>
                            <span className="text-green-400">${Number(invoice.total).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="mt-8 pt-8 border-t border-white/10">
                    <p className="text-sm text-gray-500 text-center">
                        Gracias por su preferencia. Esta es una factura electrónica válida.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
