
"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
    TrendingUp, ArrowUpRight, ArrowDownRight,
    DollarSign, Package, Users, FileText, Download,
    Calendar, Filter
} from "lucide-react";
import { motion } from "framer-motion";

export default function ReportsPage() {
    const [data, setData] = useState<any>({
        invoices: [],
        products: [],
        clients: []
    });
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState("30"); // days

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            const [invoices, products, clients] = await Promise.all([
                fetchAPI('/invoices'),
                fetchAPI('/products'),
                fetchAPI('/clients')
            ]);
            setData({ invoices, products, clients });
        } catch (error) {
            console.error("Error loading report data", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Calculations ---

    const paidInvoices = data.invoices.filter((inv: any) => inv.status === 'PAID');
    const totalRevenue = paidInvoices.reduce((sum: number, inv: any) => sum + Number(inv.total), 0);
    const totalTax = paidInvoices.reduce((sum: number, inv: any) => sum + Number(inv.tax), 0);
    const avgInvoiceValue = paidInvoices.length > 0 ? totalRevenue / paidInvoices.length : 0;

    // Sales by day (last 30 days)
    const last30Days = [...Array(30)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        const dateStr = d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        const dayRevenue = paidInvoices
            .filter((inv: any) => new Date(inv.createdAt).toDateString() === d.toDateString())
            .reduce((sum: number, inv: any) => sum + Number(inv.total), 0);
        return { date: dateStr, revenue: dayRevenue };
    });

    // Top Selling Products
    const productSales: any = {};
    data.invoices.forEach((inv: any) => {
        if (inv.status === 'CANCELLED') return;
        inv.items.forEach((item: any) => {
            const name = item.product?.name || "Eliminado";
            productSales[name] = (productSales[name] || 0) + item.quantity;
        });
    });

    const topProducts = Object.entries(productSales)
        .map(([name, qty]) => ({ name, qty: qty as number }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);

    // Inventory Value
    const totalInventoryValue = data.products.reduce((sum: number, p: any) => sum + (Number(p.price) * p.stock), 0);
    const totalStockItems = data.products.reduce((sum: number, p: any) => sum + p.stock, 0);

    const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316'];

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Reportes Detallados</h1>
                    <p className="text-gray-400">Análisis completo de ventas e inventario</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <select
                            className="bg-transparent border-none outline-none cursor-pointer"
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                        >
                            <option value="7" className="bg-[#111]">Últimos 7 días</option>
                            <option value="30" className="bg-[#111]">Últimos 30 días</option>
                            <option value="90" className="bg-[#111]">Últimos 90 días</option>
                        </select>
                    </div>
                    <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20">
                        <Download className="w-4 h-4" /> Exportar Reporte
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <ReportCard
                    title="Ventas Totales (Neto)"
                    value={`$${totalRevenue.toFixed(2)}`}
                    subValue="+12% vs mes anterior"
                    positive={true}
                    icon={TrendingUp}
                    color="green"
                />
                <ReportCard
                    title="Impuestos Recaudados"
                    value={`$${totalTax.toFixed(2)}`}
                    subValue="IVA (19% promedio)"
                    icon={DollarSign}
                    color="blue"
                />
                <ReportCard
                    title="Ticket Promedio"
                    value={`$${avgInvoiceValue.toFixed(2)}`}
                    subValue={`De ${paidInvoices.length} facturas`}
                    icon={FileText}
                    color="purple"
                />
                <ReportCard
                    title="Valor del Inventario"
                    value={`$${totalInventoryValue.toFixed(2)}`}
                    subValue={`${totalStockItems} unidades en stock`}
                    icon={Package}
                    color="indigo"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Revenue History */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 p-6 rounded-2xl lg:col-span-2 h-[400px]"
                >
                    <h3 className="text-lg font-bold mb-6 flex items-center justify-between">
                        Historial de Ingresos
                        <span className="text-xs font-normal text-gray-500 bg-white/5 px-2 py-1 rounded-md">Real-time Data</span>
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={last30Days}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Top Products */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 border border-white/10 p-6 rounded-2xl h-[400px]"
                >
                    <h3 className="text-lg font-bold mb-6">Productos Más Vendidos</h3>
                    <div className="space-y-6">
                        {topProducts.map((p, i) => (
                            <div key={i} className="group">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{p.name}</span>
                                    <span className="text-xs font-bold text-gray-500">{p.qty} vendidos</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(p.qty / topProducts[0].qty) * 100}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                    />
                                </div>
                            </div>
                        ))}
                        {topProducts.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                                <Package className="w-12 h-12 mb-2 opacity-20" />
                                <p className="text-sm">Sin datos de ventas aún</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Invoices by Status Table-like list */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 border border-white/10 p-6 rounded-2xl"
                >
                    <h3 className="text-lg font-bold mb-6">Distribución por Cliente</h3>
                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                        {data.clients.slice(0, 10).map((client: any, i: number) => {
                            const clientRevenue = paidInvoices
                                .filter((inv: any) => inv.clientId === client.id)
                                .reduce((sum: number, inv: any) => sum + Number(inv.total), 0);

                            return (
                                <div key={client.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                                            {client.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{client.name}</p>
                                            <p className="text-[10px] text-gray-500">{client.email || 'Sin correo'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-green-400">${clientRevenue.toFixed(2)}</p>
                                        <div className="w-24 h-1 bg-white/10 rounded-full mt-1">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full"
                                                style={{ width: `${Math.min((clientRevenue / (totalRevenue || 1)) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/5 border border-white/10 p-6 rounded-2xl"
                >
                    <h3 className="text-lg font-bold mb-6">Estado de Inventario</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-xs text-gray-500 mb-1">Stock Crítico (≤ 5)</p>
                            <p className="text-2xl font-bold text-red-400">
                                {data.products.filter((p: any) => p.stock <= 5).length}
                            </p>
                            <p className="text-[10px] text-gray-600 mt-1">Productos que requieren reposición</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-xs text-gray-500 mb-1">Promedio Stock</p>
                            <p className="text-2xl font-bold text-indigo-400">
                                {(totalStockItems / (data.products.length || 1)).toFixed(1)}
                            </p>
                            <p className="text-[10px] text-gray-600 mt-1">Items por producto</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 col-span-2">
                            <p className="text-xs text-gray-500 mb-2">Valoración por Categoría (Demo Data)</p>
                            <div className="flex gap-2 items-center">
                                <div className="h-4 bg-indigo-500 rounded-lg flex-1" style={{ width: '60%' }} />
                                <div className="h-4 bg-purple-500 rounded-lg" style={{ width: '25%' }} />
                                <div className="h-4 bg-pink-500 rounded-lg" style={{ width: '15%' }} />
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] text-gray-500 uppercase font-bold">
                                <span>Electrónica (60%)</span>
                                <span>Software (40%)</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function ReportCard({ title, value, subValue, positive, icon: Icon, color }: any) {
    const colors: any = {
        green: "text-green-400 bg-green-500/10 border-green-500/10",
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/10",
        purple: "text-purple-400 bg-purple-500/10 border-purple-500/10",
        indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/10",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 transition-all group"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {subValue && (
                    <div className={`flex items-center gap-1 text-[10px] font-bold uppercase ${positive ? 'text-green-500' : 'text-gray-500'}`}>
                        {positive && <ArrowUpRight className="w-3 h-3" />}
                        {subValue}
                    </div>
                )}
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
            <p className="text-2xl font-bold text-white group-hover:scale-105 transition-transform origin-left">{value}</p>
        </motion.div>
    );
}
