import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express, Request, Response } from 'express';
import { mkdirSync } from 'fs';
import { join } from 'path';

const server: Express = express();
let isReady = false;
let initPromise: Promise<void> | null = null;

async function bootstrapServerless() {
  if (isReady) return server;

  if (!initPromise) {
    initPromise = (async () => {
      try {
        const uploadsDir = process.env.VERCEL ? '/tmp/uploads' : join(process.cwd(), 'uploads');
        mkdirSync(uploadsDir, { recursive: true });
        mkdirSync(join(uploadsDir, 'receipts'), { recursive: true });
      } catch (err) {
        console.warn('Uploads directory creation note:', err);
      }

      const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(server),
        { logger: ['error', 'warn', 'log'] },
      );

      app.enableCors({
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
      });

      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: false,
          transform: true,
        }),
      );

      await app.init();
      isReady = true;
      console.log('✅ NestJS app initialized for Vercel Serverless');
    })();
  }

  await initPromise;
  return server;
}

export default async function handler(req: Request, res: Response) {
  try {
    const expressServer = await bootstrapServerless();
    expressServer(req, res);
  } catch (error) {
    console.error('❌ Vercel Serverless Handler error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

