import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    create(createCategoryDto: CreateCategoryDto) {
        return this.prisma.category.create({
            data: createCategoryDto,
        });
    }

    findAll(companyId?: string) {
        return this.prisma.category.findMany({
            where: {
                deletedAt: null,
                ...(companyId ? { companyId } : {})
            },
            include: {
                _count: {
                    select: { products: true },
                },
            },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string) {
        const category = await this.prisma.category.findFirst({
            where: { id, deletedAt: null },
            include: { products: true },
        });
        if (!category) throw new Error('Categoría no encontrada');
        return category;
    }

    update(id: string, updateCategoryDto: UpdateCategoryDto) {
        return this.prisma.category.update({
            where: { id },
            data: updateCategoryDto,
        });
    }

    async remove(id: string) {
        return this.prisma.category.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
}
