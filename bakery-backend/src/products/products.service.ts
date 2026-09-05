import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(categoryId?: number, search?: string, lowStock?: boolean) {
    return this.prisma.product.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(search
          ? { name: { contains: search, mode: 'insensitive' } }
          : {}),
        ...(lowStock ? { stock: { lte: 5 } } : {}),
      },
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    const { expiryDate, ...rest } = dto;
    return this.prisma.product.create({
      data: {
        ...rest,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      },
      include: { category: true },
    });
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id);
    const { expiryDate, ...rest } = dto;
    return this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(expiryDate !== undefined
          ? { expiryDate: expiryDate ? new Date(expiryDate) : null }
          : {}),
      },
      include: { category: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }

  async updateStock(id: number, delta: number) {
    return this.prisma.product.update({
      where: { id },
      data: { stock: { increment: delta } },
    });
  }
}
