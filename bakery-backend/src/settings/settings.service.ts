import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get(userId: number) {
    let settings = await this.prisma.settings.findUnique({ where: { userId } });
    if (!settings) {
      settings = await this.prisma.settings.create({ data: { userId } });
    }
    return settings;
  }

  async update(userId: number, dto: UpdateSettingsDto) {
    return this.prisma.settings.upsert({
      where: { userId },
      update: dto,
      create: { userId, ...dto },
    });
  }
}
