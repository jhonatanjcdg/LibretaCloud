
"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import { TrendingUp, Package, Users, FileText, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function DashboardPage() {
    const [stats, setStats] = useState({ products: 0, clients: 0, invoices: 0, revenue: 0 });
    const [invoices, setInvoices] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [productsData, clientsData, invoicesData] = await Promise.all([
                fetchAPI('/products'),
                fetchAPI('/clients'),
                fetchAPI('/invoices')
            ]);

            const totalRevenue = invoicesData
                .filter((inv: any) => inv.status === 'PAID')
                .reduce((sum: number, inv: any) => sum + Number(inv.total), 0);

            setStats({
                products: productsData.length,
                clients: clientsData.length,
                invoices: invoicesData.length,
                revenue: totalRevenue
            });
            setInvoices(invoicesData);
            setLowStockProducts(productsData.filter((p: any) => p.stock <= 5));
        } catch (e) {
            console.error("Error loading dashboard data", e);
        } finally {
            setLoading(false);
        }
    };

    // Prepare chart data
    const statusData = [
        { name: 'Borradores', value: invoices.filter((i: any) => i.status === 'DRAFT').length, color: '#6B7280' },
        { name: 'Emitidas', value: invoices.filter((i: any) => i.status === 'ISSUED').length, color: '#3B82F6' },
        { name: 'Pagadas', value: invoices.filter((i: any) => i.status === 'PAID').length, color: '#10B981' },
        { name: 'Canceladas', value: invoices.filter((i: any) => i.status === 'CANCELLED').length, color: '#EF4444' },
    ];

    // Monthly revenue (mock data for demo - in real app, aggregate by month)
    const monthlyData = [
        { month: 'Ene', revenue: 0 },
        { month: 'Feb', revenue: 0 },
        { month: 'Mar', revenue: 0 },
        { month: 'Abr', revenue: 0 },
        { month: 'May', revenue: 0 },
        { month: 'Jun', revenue: stats.revenue },
    ];

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-gray-400">Resumen general de tu negocio</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Ingresos Totales" value={`$${stats.revenue.toFixed(2)}`} icon={TrendingUp} color="green" />
                <StatCard
                    title="Facturas"
                    value={stats.invoices}
                    icon={FileText}
                    color="blue"
                    onClick={() => window.location.href = '/dashboard/invoices'}
                />
                <StatCard
                    title="Productos"
                    value={stats.products}
                    icon={Package}
                    color="indigo"
                    onClick={() => window.location.href = '/dashboard/products'}
                />
                <StatCard
                    title="Clientes"
                    value={stats.clients}
                    icon={Users}
                    color="purple"
                    onClick={() => window.location.href = '/dashboard/clients'}
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Revenue Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 p-6 rounded-2xl h-[350px]"
                >
                    <h3 className="text-lg font-bold mb-4">Ingresos Mensuales</h3>
                    {isClient && (
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="month" stroke="#999" />
                                    <YAxis stroke="#999" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444', borderRadius: '12px', padding: '10px' }}
                                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                        labelStyle={{ color: '#999' }}
                                    />
                                    <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </motion.div>

                {/* Invoice Status Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 border border-white/10 p-6 rounded-2xl h-[350px]"
                >
                    <h3 className="text-lg font-bold mb-4">Estado de Facturas</h3>
                    {isClient && (
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData.filter(d => d.value > 0)}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={true}
                                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {statusData.filter(d => d.value > 0).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444', borderRadius: '12px', padding: '10px' }}
                                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                        labelStyle={{ color: '#999' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Alertas e Invoices */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Low Stock Alerts */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 border border-white/10 p-6 rounded-2xl lg:col-span-1"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        <h3 className="text-lg font-bold">Stock Bajo</h3>
                    </div>
                    <div className="space-y-3">
                        {lowStockProducts.slice(0, 6).map((product: any) => (
                            <div key={product.id} className="flex justify-between items-center p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                                <div>
                                    <p className="font-medium text-sm">{product.name}</p>
                                    <p className="text-xs text-amber-500/60 leading-none mt-1">Ref: {product.id.slice(0, 5).toUpperCase()}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock === 0 ? 'bg-red-500 text-white' : 'bg-amber-500/20 text-amber-400'}`}>
                                    {product.stock} disp.
                                </span>
                            </div>
                        ))}
                        {lowStockProducts.length === 0 && (
                            <p className="text-center text-gray-500 py-8 text-sm">Todo el stock está al día</p>
                        )}
                        {lowStockProducts.length > 6 && (
                            <button
                                onClick={() => window.location.href = '/dashboard/products'}
                                className="w-full text-center text-xs text-indigo-400 hover:text-indigo-300 mt-2"
                            >
                                Ver todos (+{lowStockProducts.length - 6})
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Recent Invoices */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/5 border border-white/10 p-6 rounded-2xl lg:col-span-2"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Facturas Recientes</h3>
                        <a href="/dashboard/invoices" className="text-sm text-indigo-400 hover:text-indigo-300">
                            Ver todas →
                        </a>
                    </div>
                    <div className="space-y-3">
                        {invoices.slice(0, 6).map((invoice: any) => (
                            <div key={invoice.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer border border-white/5"
                                onClick={() => window.location.href = `/dashboard/invoices/${invoice.id}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-green-500/10 rounded flex items-center justify-center text-green-400">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Factura #{invoice.number || invoice.id.slice(0, 8)}</p>
                                        <p className="text-xs text-gray-500">{invoice.client?.name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-400">${Number(invoice.total).toFixed(2)}</p>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold bg-white/5 text-gray-400">{invoice.status}</span>
                                </div>
                            </div>
                        ))}
                        {invoices.length === 0 && (
                            <p className="text-center text-gray-500 py-8">No hay facturas aún</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, onClick }: any) {
    const colors: any = {
        indigo: "from-indigo-500/20 to-indigo-600/5 border-indigo-500/20",
        purple: "from-purple-500/20 to-purple-600/5 border-purple-500/20",
        green: "from-green-500/20 to-green-600/5 border-green-500/20",
        blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20",
    };

    const iconColors: any = {
        indigo: "text-indigo-400 bg-indigo-500/20",
        purple: "text-purple-400 bg-purple-500/20",
        green: "text-green-400 bg-green-500/20",
        blue: "text-blue-400 bg-blue-500/20",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onClick}
            className={`p-6 rounded-2xl border bg-gradient-to-br ${colors[color]} ${onClick ? 'cursor-pointer hover:border-white/30 transition-all' : ''}`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColors[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">{title}</h3>
            <p className="text-3xl font-bold text-white">{value}</p>
        </motion.div>
    );
}
