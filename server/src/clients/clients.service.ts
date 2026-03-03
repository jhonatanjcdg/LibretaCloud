
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) { }

  create(createClientDto: CreateClientDto) {
    return this.prisma.client.create({
      data: createClientDto,
    });
  }

  findAll(companyId?: string) {
    return this.prisma.client.findMany({
      where: {
        deletedAt: null,
        ...(companyId ? { companyId } : {})
      },
      include: { company: true }
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, deletedAt: null },
    });
    if (!client) throw new Error('Cliente no encontrado');
    return client;
  }

  update(id: string, updateClientDto: UpdateClientDto) {
    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  }

  async remove(id: string) {
    return this.prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}
