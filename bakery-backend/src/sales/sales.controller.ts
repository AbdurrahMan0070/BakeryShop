import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Query,
  Res,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(@Body() dto: CreateSaleDto) {
    return this.salesService.create(dto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.salesService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      from,
      to,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.findOne(id);
  }

  @Get(':id/receipt')
  async downloadReceipt(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const sale = await this.salesService.findOne(id);

    if (!sale.pdfUrl) {
      throw new NotFoundException('Receipt not available for this sale');
    }

    // pdfUrl is like /uploads/receipts/receipt-1-xxx.pdf
    const relativePath = sale.pdfUrl.replace(/^\//, '');
    const vercelPath = join('/tmp', relativePath);
    const localPath = join(process.cwd(), relativePath);
    const filePath = existsSync(vercelPath) ? vercelPath : localPath;

    if (!existsSync(filePath)) {
      throw new NotFoundException('Receipt file not found');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="receipt-${String(id).padStart(4, '0')}.pdf"`,
    );
    res.sendFile(filePath);
  }
}
