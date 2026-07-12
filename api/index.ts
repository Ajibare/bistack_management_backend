import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import serverlessExpress from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

// Lazily-initialized serverless handler. The Express instance is created
// once on the first cold-start invocation and reused across subsequent
// warm invocations to avoid re-bootstrapping Nest every time.
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

const handler: Handler = async (
  event: unknown,
  context: Context,
  callback: Callback,
) => {
  if (!cachedServer) {
    cachedServer = await bootstrapServer();
  }
  return cachedServer(event, context, callback);
};

export default handler;
