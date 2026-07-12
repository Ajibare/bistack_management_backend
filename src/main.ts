import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import serverlessExpress from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

// Lazily-initialized serverless handler. The Express instance is created
// once and reused across invocations to avoid the cost of bootstrapping
// Nest on every cold start request.
let cachedServer: Handler | null = null;

async function bootstrapServer(): Promise<Handler> {
  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

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

  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: unknown,
  context: Context,
  callback: Callback,
) => {
  if (!cachedServer) {
    cachedServer = await bootstrapServer();
  }
  return cachedServer(event, context, callback);
};

// Local development entrypoint. When the file is run directly (e.g.
// `node dist/main.js` or `npm run start:prod`), start a real HTTP server
// on port 3001 instead of the Lambda handler.
async function bootstrapLocal(): Promise<void> {
  const app = await NestFactory.create(AppModule);
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
  await app.listen(3001);
}

if (require.main === module) {
  void bootstrapLocal();
}
