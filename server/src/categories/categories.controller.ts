import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post()
    create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoriesService.create(createCategoryDto);
    }

    @Get()
    findAll(@Query('companyId') companyId?: string) {
        return this.categoriesService.findAll(companyId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.categoriesService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
        return this.categoriesService.update(id, updateCategoryDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.categoriesService.remove(id);
    }
}
