
import { PrismaClient, Role, InvoiceStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️  Limpiando base de datos...');

    // Limpiar en orden inverso de dependencias
    await prisma.invoiceItem.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.product.deleteMany();
    await prisma.client.deleteMany();
    await prisma.user.deleteMany();
    await prisma.company.deleteMany();

    console.log('🌱 Sembrando datos de prueba...');

    // 1. Crear Empresa
    const company = await prisma.company.create({
        data: {
            name: 'Libreta Cloud Corp',
            nit: '900.123.456-1',
            address: 'Calle Falsa 123, Bogotá',
            phone: '3001234567',
            email: 'contacto@libretacloud.test',
            website: 'www.libretacloud.test',
        },
    });

    // 2. Crear Usuario Admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@test.com',
            password: hashedPassword,
            name: 'Admin Libreta',
            role: Role.ADMIN,
            companyId: company.id,
        },
    });

    // 3. Crear Clientes
    const client1 = await prisma.client.create({
        data: {
            name: 'Juan Pérez S.A.',
            nit: '800.555.444-2',
            email: 'juan@perez.com',
            address: 'Av. Siempre Viva 742',
            companyId: company.id,
        },
    });

    const client2 = await prisma.client.create({
        data: {
            name: 'Tech Solutions Ltda',
            nit: '901.999.888-3',
            email: 'ventas@techsolutions.test',
            companyId: company.id,
        },
    });

    // 4. Crear Productos
    const prod1 = await prisma.product.create({
        data: {
            name: 'Laptop Gamer X1',
            description: 'i7, 16GB RAM, RTX 3060',
            price: 1500.00,
            stock: 50,
            taxRate: 0.19, // 19% IVA
            companyId: company.id,
        },
    });

    const prod2 = await prisma.product.create({
        data: {
            name: 'Monitor 4K 27"',
            description: 'Panel IPS, 144Hz',
            price: 450.00,
            stock: 100,
            taxRate: 0.19,
            companyId: company.id,
        },
    });

    const prod3 = await prisma.product.create({
        data: {
            name: 'Consultoría IT (Hora)',
            description: 'Servicios profesionales de arquitectura cloud',
            price: 85.00,
            stock: 999,
            taxRate: 0.0, // Exento
            companyId: company.id,
        },
    });

    // 5. Crear Factura de Prueba (Pagada)
    const invoice1 = await prisma.invoice.create({
        data: {
            clientId: client1.id,
            companyId: company.id,
            status: InvoiceStatus.PAID,
            subtotal: 1950.00,
            tax: 370.50, // (1500+450) * 0.19
            total: 2320.50,
            items: {
                create: [
                    {
                        productId: prod1.id,
                        quantity: 1,
                        price: 1500.00,
                        tax: 285.00,
                        total: 1785.00,
                    },
                    {
                        productId: prod2.id,
                        quantity: 1,
                        price: 450.00,
                        tax: 85.50,
                        total: 535.50,
                    }
                ]
            }
        }
    });

    // 6. Crear Factura de Prueba (Borrador)
    const invoice2 = await prisma.invoice.create({
        data: {
            clientId: client2.id,
            companyId: company.id,
            status: InvoiceStatus.DRAFT,
            subtotal: 170.00,
            tax: 0.0,
            total: 170.00,
            items: {
                create: [
                    {
                        productId: prod3.id,
                        quantity: 2,
                        price: 85.00,
                        tax: 0.0,
                        total: 170.00,
                    }
                ]
            }
        }
    });

    console.log('✅ Base de datos sembrada con éxito.');
    console.log(`
    --- CREDENCIALES ---
    Email: admin@test.com
    Password: admin123
    --------------------
  `);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
