# ⚡ LibretaCloud ERP

LibretaCloud es un sistema ERP moderno y elegante diseñado para la gestión de inventarios, clientes y facturación electrónica. Desarrollado con una arquitectura robusta y una interfaz premium.

## 🚀 Características Principales

- 📊 **Dashboard Dinámico**: Resumen de ingresos, facturas y alertas de stock en tiempo real.
- 📦 **Gestión de Inventario**: Control estricto de existencias con prevención de stock negativo.
- 📑 **Facturación**: Creación, edición y anulación de facturas con generación de PDF profesional.
- 📈 **Reportes Avanzados**: Gráficos analíticos de ventas y valoración de mercancía.
- 👥 **Gestión de Usuarios**: Sistema de roles (Admin, Usuario, Contador).

## 🛠️ Stack Tecnológico

- **Frontend**: [Next.js 14+](https://nextjs.org/), React, Tailwind CSS, Framer Motion (Animaciones), Lucide React (Iconos).
- **Backend**: [NestJS](https://nestjs.com/), Prisma ORM, PostgreSQL.
- **Documentación**: Swagger/OpenAPI.
- **Infraestructura**: Docker & Docker Compose.

## 🐳 Instalación con Docker (Recomendado)

Si tienes Docker instalado, puedes levantar todo el ecosistema (DB + Backend + Frontend) con un solo comando:

```bash
docker-compose up --build
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Base de Datos**: PostgreSQL en el puerto 5432

## 🔧 Configuración Manual

### Backend
1. Entrar a `/server`
2. Instalar dependencias: `npm install`
3. Configurar `.env` con tu `DATABASE_URL`
4. Ejecutar migraciones: `npx prisma migrate dev`
5. Iniciar: `npm run start:dev`

### Frontend
1. Entrar a `/client`
2. Instalar dependencias: `npm install`
3. Iniciar: `npm run dev`

## 👥 Autores
- [Tu Nombre/Usuario] - Desarrollo Principal
- LibretaCloud Team

## 📄 Licencia
Este proyecto es de uso privado para LibretaCloud.