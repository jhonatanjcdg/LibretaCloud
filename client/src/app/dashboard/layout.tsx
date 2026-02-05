
"use client";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#050505]">
            <Sidebar />
            <main className="pl-64">
                {children}
            </main>
        </div>
    );
}
