import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // Single-owner app: only allow registration if no user exists yet
    const userCount = await this.prisma.user.count();
    if (userCount > 0) {
      throw new ConflictException('Registration is closed. This app is for the owner only.');
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: 'OWNER',
        settings: { create: {} },
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const token = this.signToken(user.id, user.email, user.role, user.name);
    return { access_token: token, user };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _pw, ...safeUser } = user;
    const token = this.signToken(user.id, user.email, user.role, user.name);
    return { access_token: token, user: safeUser };
  }

  async me(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  }

  private signToken(id: number, email: string, role: string, name: string) {
    return this.jwtService.sign(
      { sub: id, email, role, name },
      {
        secret: this.configService.get<string>('JWT_SECRET', 'bakery-secret-key'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '7d') as any,
      },
    );
  }
}
