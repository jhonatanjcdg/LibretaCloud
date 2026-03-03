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
            where: companyId ? { companyId } : {},
            include: {
                _count: {
                    select: { products: true },
                },
            },
            orderBy: { name: 'asc' },
        });
    }

    findOne(id: string) {
        return this.prisma.category.findUnique({
            where: { id },
            include: { products: true },
        });
    }

    update(id: string, updateCategoryDto: UpdateCategoryDto) {
        return this.prisma.category.update({
            where: { id },
            data: updateCategoryDto,
        });
    }

    async remove(id: string) {
        return await this.prisma.category.delete({
            where: { id },
        });
    }
}
