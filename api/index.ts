import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { type Express } from 'express';

let cachedExpressApp: Express | null = null;

async function bootstrapServer(): Promise<Express> {
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

  app.enableCors({
    origin: [
      'https://bistack-management-backend.vercel.app',
      'https://bigstack-management.vercel.app',
      'http://localhost:3000',
    ],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');

  await app.init();
  return expressApp;
}

export default async function handler(req: any, res: any) {
  if (!cachedExpressApp) {
    cachedExpressApp = await bootstrapServer();
  }

  cachedExpressApp(req, res);
}
