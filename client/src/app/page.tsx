"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BarChart3,
  ShieldCheck,
  Zap,
  Globe,
  ArrowRight,
  Menu,
  X,
  CreditCard,
  LayoutDashboard
} from "lucide-react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center glow">
              <Zap className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              LibretaCloud
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Funcionalidades</a>
            <a href="#" className="hover:text-white transition-colors">Precios</a>
            <a href="#" className="hover:text-white transition-colors">Nosotros</a>
            <button className="px-6 py-2.5 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all">
              Probar Gratis
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-sm font-medium mb-6 inline-block">
              Versión 1.0 ya disponible
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight leading-tight">
              Gestiona tu negocio <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                a la velocidad del rayo
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              La plataforma administrativa inteligente que automatiza tu contabilidad,
              facturación y stock en un solo lugar. Simple, potente y en la nube.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg flex items-center gap-2 transition-all glow group">
                Empezar Ahora <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 glass text-white rounded-xl font-bold text-lg hover:bg-white/5 transition-all">
                Ver Demo
              </button>
            </div>
          </motion.div>

          {/* Dashboard Image Mockup */}
          <motion.div
            className="mt-20 relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-indigo-600/20 blur-[100px] -z-10 rounded-full" />
            <div className="glass p-2 rounded-2xl overflow-hidden animate-float">
              <Image
                src="/dashboard-mockup.png"
                alt="LibretaCloud Dashboard"
                width={1200}
                height={800}
                className="rounded-xl shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8 text-indigo-400" />}
            title="Analítica en Tiempo Real"
            desc="Visualiza el estado de tu empresa con gráficos interactivos y reportes inteligentes."
          />
          <FeatureCard
            icon={<ShieldCheck className="w-8 h-8 text-purple-400" />}
            title="Seguridad Bancaria"
            desc="Tus datos están protegidos con encriptación de grado militar y backups automáticos."
          />
          <FeatureCard
            icon={<Globe className="w-8 h-8 text-pink-400" />}
            title="Acceso desde donde sea"
            desc="Controla tu negocio desde tu celular, tablet o computadora, sin instalar nada."
          />
        </div>
      </section>

      {/* Mini Stats Banner */}
      <section className="py-20">
        <div className="glass border-x-0 border-y py-12">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatItem val="100%" label="Nube" />
            <StatItem val="+5k" label="Usuarios" />
            <StatItem val="SEC" label="Facturación" />
            <StatItem val="24/7" label="Soporte" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto glass p-12 md:p-20 rounded-3xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6">¿Listo para transformar tu gestión?</h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Únete a cientos de emprendedores que ya están automatizando su éxito.
            Prueba LibretaCloud gratis por 14 días.
          </p>
          <button className="px-10 py-4 bg-white text-black rounded-xl font-bold text-xl hover:bg-gray-200 transition-all shadow-xl">
            Crear cuenta gratuita
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Zap className="text-indigo-500 w-5 h-5" />
            <span className="font-bold">LibretaCloud</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 LibretaCloud Inc. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="glass p-8 rounded-3xl hover:border-indigo-500/50 transition-all group">
      <div className="mb-6 p-4 bg-white/5 rounded-2xl w-fit group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function StatItem({ val, label }: { val: string, label: string }) {
  return (
    <div>
      <div className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 mb-2">
        {val}
      </div>
      <div className="text-gray-500 font-medium uppercase tracking-widest text-xs">
        {label}
      </div>
    </div>
  );
}
