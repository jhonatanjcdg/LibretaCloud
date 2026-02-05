
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    Users,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Zap,
    BarChart3,
    UserCog
} from "lucide-react";
import { motion } from "framer-motion";

export function Sidebar() {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const links = [
        { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/dashboard/products", icon: Package, label: "Productos" },
        { href: "/dashboard/clients", icon: Users, label: "Clientes" },
        { href: "/dashboard/invoices", icon: FileText, label: "Facturas" },
        { href: "/dashboard/reports", icon: BarChart3, label: "Reportes" },
        ...(user?.role === 'ADMIN' ? [{ href: "/dashboard/users", icon: UserCog, label: "Usuarios" }] : []),
        { href: "/dashboard/settings", icon: Settings, label: "Configuración" },
    ];

    return (
        <div className="w-64 h-screen bg-black border-r border-white/10 flex flex-col fixed left-0 top-0">
            <div className="p-6">
                <Link href="/dashboard" className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Zap className="text-white w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg text-white">LibretaCloud</span>
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                ? "bg-indigo-600/10 text-indigo-400 border border-indigo-600/20"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <link.icon className="w-5 h-5" />
                            <span className="font-medium">{link.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="activeIndicator"
                                    className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/10">
                <div className="bg-white/5 rounded-xl p-4 mb-4">
                    <p className="text-sm font-bold text-white mb-1">{user?.name || "Usuario"}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <button
                    onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        window.location.href = "/auth/login";
                    }}
                    className="flex items-center gap-3 text-red-400 hover:text-red-300 w-full px-4 py-2"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
}
