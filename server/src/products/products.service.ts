
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  async create(createProductDto: CreateProductDto) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: createProductDto,
      });

      if (product.stock > 0) {
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            quantity: product.stock,
            type: 'IN',
            reason: 'Stock inicial',
            companyId: product.companyId,
          },
        });
      }

      return product;
    });
  }

  findAll() {
    return this.prisma.product.findMany({
      include: {
        company: true,
        category: true
      }
    });
  }

  findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true }
    });
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: string) {
    try {
      return await this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2003') {
        throw new Error('No se puede eliminar el producto porque está incluido en facturas existentes.');
      }
      throw error;
    }
  }
}
