
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(createUserDto: any) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // If companyId is provided, just create the user in that company
    if (createUserDto.companyId) {
      return this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
      });
    }

    // Default registration logic (creates new company)
    return this.prisma.$transaction(async (tx) => {
      const companyName = createUserDto.name
        ? `${createUserDto.name}'s Company`
        : `Empresa ${Date.now()}`;

      const company = await tx.company.create({
        data: {
          name: companyName,
          nit: `NIT-${Date.now()}`,
        }
      });

      return tx.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
          companyId: company.id,
          role: Role.ADMIN,
        },
      });
    });
  }

  findAllByCompany(companyId: string) {
    return this.prisma.user.findMany({
      where: { companyId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        companyId: true
      }
    });
  }

  async findOne(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOneById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
