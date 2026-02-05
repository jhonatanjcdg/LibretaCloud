
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const companyId = "fb07ab35-75ce-4c6b-a6e6-bab72a41b356";

    console.log('Starting seed...');

    // Create 20 products
    const products = [
        { name: 'Laptop Pro 16', price: 2500, stock: 15, description: 'Potente laptop para diseño y desarrollo' },
        { name: 'Monitor 4K UltraWide', price: 550, stock: 10, description: 'Monitor IPS de 34 pulgadas' },
        { name: 'Teclado Mecánico RGB', price: 120, stock: 50, description: 'Switches Cherry MX Blue' },
        { name: 'Mouse Ergonómico', price: 80, stock: 45, description: 'Sensor de alta precisión' },
        { name: 'Auriculares Noise Cancelling', price: 300, stock: 20, description: 'Cancelación de ruido activa' },
        { name: 'Escritorio Elevable', price: 450, stock: 8, description: 'Escritorio con motor dual' },
        { name: 'Silla Pro Gaming', price: 350, stock: 12, description: 'Máximo confort para largas horas' },
        { name: 'Webcam 4K', price: 150, stock: 30, description: 'Ideal para streaming profesional' },
        { name: 'Micrófono de Condensador', price: 200, stock: 15, description: 'Calidad de estudio' },
        { name: 'Disco Duro Externo 2TB', price: 100, stock: 60, description: 'USB-C y Thunderbolt ready' },
        { name: 'Cable HDMI 2.1', price: 25, stock: 100, description: 'Soporta 8K a 60Hz' },
        { name: 'Adaptador Multi-puerto USB-C', price: 70, stock: 40, description: 'HDMI, USB-A, SD Card' },
        { name: 'Tablet Grafica', price: 400, stock: 10, description: 'Para artistas digitales' },
        { name: 'Router WiFi 6', price: 180, stock: 25, description: 'Velocidad ultra rápida' },
        { name: 'Smartwatch V3', price: 220, stock: 35, description: 'GPS y sensor de oxígeno' },
        { name: 'Smartphone Z Plus', price: 950, stock: 18, description: 'Cámara triple de 108MP' },
        { name: 'Cámara Mirrorless 24MP', price: 1200, stock: 5, description: 'Lente 24-70mm incluido' },
        { name: 'Impresora Laser Pro', price: 300, stock: 15, description: 'Bajo costo por página' },
        { name: 'Lámpara de Escritorio Inteligente', price: 60, stock: 50, description: 'Control por voz y app' },
        { name: 'Powerbank 20000mAh', price: 50, stock: 80, description: 'Carga rápida dual' }
    ];

    for (const product of products) {
        await prisma.product.create({
            data: {
                ...product,
                companyId: companyId,
                sku: `SKU-${Math.random().toString(36).substring(7).toUpperCase()}`
            }
        });
    }

    // Create 10 clients
    const clients = [
        { name: 'TecnoGlobal S.A.', nit: '900.123.456-1', email: 'contacto@tecnoglobal.com', phone: '3101234567', address: 'Calle 100 #15-30, Bogotá' },
        { name: 'Soluciones Digitales SAS', nit: '800.987.654-2', email: 'info@soludigi.co', phone: '3009988776', address: 'Carrera 45 #80-12, Medellín' },
        { name: 'MegaMarket Ltda.', nit: '901.555.444-3', email: 'compras@megamarket.com', phone: '3204433221', address: 'Avenida 5ta #2-40, Cali' },
        { name: 'Innova Soft', nit: '890.333.222-4', email: 'hello@innovasoft.io', phone: '3156677889', address: 'Calle 72 #9-55, Bogotá' },
        { name: 'Distribuidora del Caribe', nit: '811.000.111-5', email: 'admin@caribdist.com', phone: '3012233445', address: 'Paseo de Bolívar #4, Barranquilla' },
        { name: 'Andina Tech', nit: '900.888.777-6', email: 'ventas@andinatech.com', phone: '3187766554', address: 'Zona Industrial, Manizales' },
        { name: 'Futuro S.A.S.', nit: '830.444.999-7', email: 'gerencia@futuro.com', phone: '3051122334', address: 'Barrio Getsemaní, Cartagena' },
        { name: 'E-Commerce Pro', nit: '901.222.111-8', email: 'support@ecommercepro.net', phone: '3218877665', address: 'Oficinas Virtuales, Remoto' },
        { name: 'Logística Total', nit: '800.777.666-9', email: 'operaciones@logtotal.co', phone: '3123344556', address: 'Puerto Industrial, Buenaventura' },
        { name: 'Consultoría Integral', nit: '900.000.111-0', email: 'director@consultoria.com', phone: '3149988770', address: 'Carrera 7 #32-16, Bogotá' }
    ];

    for (const client of clients) {
        await prisma.client.create({
            data: {
                ...client,
                companyId: companyId
            }
        });
    }

    console.log('Seed finished successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
