
"use client";

import { fetchAPI } from "@/lib/api";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Download, Mail, Printer, Send, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
            PARTIAL: "bg-yellow-500/20 text-yellow-400 border-yellow-500/20",
            PAID: "bg-green-500/20 text-green-400 border-green-500/20",
            CANCELLED: "bg-red-500/20 text-red-400 border-red-500/20",
        };
        return colors[status] || colors.DRAFT;
    };

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentData, setPaymentData] = useState({
        amount: 0,
        method: 'TRANSFER' as any,
        note: ''
    });

    const totalPaid = invoice.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
    const balance = Number(invoice.total) - totalPaid;

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            await fetchAPI('/payments', {
                method: 'POST',
                body: JSON.stringify({
                    ...paymentData,
                    invoiceId: invoice.id,
                    companyId: user.companyId,
                    amount: Number(paymentData.amount)
                })
            });
            setIsPaymentModalOpen(false);
            setPaymentData({ amount: 0, method: 'TRANSFER', note: '' });
            loadInvoice();
        } catch (error) {
            alert("Error registrando pago: " + error);
        }
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
                    <div className="flex flex-col items-end gap-2">
                        <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                        </span>
                        {balance > 0 && invoice.status !== 'CANCELLED' && (
                            <span className="text-xs text-yellow-500 font-medium">Saldo pendiente: ${balance.toFixed(2)}</span>
                        )}
                    </div>
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

                {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && invoice.status !== 'DRAFT' && (
                    <button
                        onClick={() => {
                            setPaymentData({ ...paymentData, amount: balance });
                            setIsPaymentModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl transition-colors ml-auto"
                    >
                        <CheckCircle className="w-4 h-4" /> Registrar Pago
                    </button>
                )}

                {invoice.status !== 'CANCELLED' && invoice.status !== 'PAID' && (
                    <button
                        onClick={() => {
                            if (confirm("¿Estás seguro de que deseas cancelar esta factura?")) {
                                updateStatus('CANCELLED');
                            }
                        }}
                        className={`flex items-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 px-4 py-2 rounded-xl transition-colors ${['DRAFT', 'ISSUED', 'PARTIAL'].includes(invoice.status) ? '' : 'ml-auto'}`}
                    >
                        <XCircle className="w-4 h-4" /> Cancelar
                    </button>
                )}
            </div>

            {/* Invoice Details */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8"
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

                {/* Totals & Payments Summary */}
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        {invoice.payments?.length > 0 && (
                            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                                <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" /> HISTORIAL DE PAGOS
                                </h3>
                                <div className="space-y-3">
                                    {invoice.payments.map((p: any) => (
                                        <div key={p.id} className="flex justify-between text-sm py-2 border-b border-white/5 last:border-0">
                                            <div>
                                                <p className="font-medium">{p.method}</p>
                                                <p className="text-xs text-gray-500">{new Date(p.date).toLocaleDateString()}</p>
                                            </div>
                                            <span className="font-bold text-green-400">+${Number(p.amount).toFixed(2)}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between pt-2 text-sm font-bold border-t border-white/10">
                                        <span>Total Pagado:</span>
                                        <span className="text-green-400">${totalPaid.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="space-y-3">
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
                            <span className="text-white">${Number(invoice.total).toFixed(2)}</span>
                        </div>
                        {totalPaid > 0 && (
                            <div className="flex justify-between text-lg font-bold text-green-400">
                                <span>Pagado:</span>
                                <span>-${totalPaid.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-xl font-bold pt-3 border-t border-white/10 text-indigo-400">
                            <span>SALDO:</span>
                            <span>${balance.toFixed(2)}</span>
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

            {/* Payment Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#111] border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl relative"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600" />
                        <h2 className="text-2xl font-bold mb-6">Registrar Pago</h2>
                        <form onSubmit={handlePayment} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Monto del Pago</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        max={balance}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-8 pr-4 focus:outline-none focus:border-green-500 transition-colors"
                                        value={paymentData.amount}
                                        onChange={e => setPaymentData({ ...paymentData, amount: Number(e.target.value) })}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Saldo pendiente: ${balance.toFixed(2)}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Método de Pago</label>
                                <select
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                                    value={paymentData.method}
                                    onChange={e => setPaymentData({ ...paymentData, method: e.target.value as any })}
                                >
                                    <option value="TRANSFER" className="bg-black">Transferencia Bancaria</option>
                                    <option value="CASH" className="bg-black">Efectivo</option>
                                    <option value="CARD" className="bg-black">Tarjeta Débito/Crédito</option>
                                    <option value="CHECK" className="bg-black">Cheque</option>
                                    <option value="OTHER" className="bg-black">Otro</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Nota (Opcional)</label>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                                    placeholder="Referencia de transferencia, recibo #..."
                                    value={paymentData.note}
                                    onChange={e => setPaymentData({ ...paymentData, note: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsPaymentModalOpen(false)}
                                    className="flex-1 py-3.5 font-bold hover:bg-white/5 rounded-xl transition-colors border border-white/5"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-green-500/20 active:scale-95"
                                >
                                    Confirmar Pago
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
