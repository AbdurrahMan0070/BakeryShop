import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { mkdirSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  // Ensure uploads directory exists safely (handling serverless read-only filesystem)
  try {
    const uploadsDir = process.env.VERCEL ? '/tmp/uploads' : join(process.cwd(), 'uploads');
    mkdirSync(uploadsDir, { recursive: true });
  } catch (err) {
    console.warn('Uploads directory creation skipped:', err);
  }

  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.VERCEL) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
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

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🍞 Bakery API running on http://localhost:${port}`);
}

bootstrap();
