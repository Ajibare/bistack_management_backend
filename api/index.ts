import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { type Express } from 'express';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, connect as mongooseConnect, connection as mongooseConnection } from 'mongoose';

// Build marker — bump this string whenever you need to force Vercel to skip
// its transpilation cache and re-run the build. It is logged on every cold
// start so you can confirm in Vercel logs which version is actually running.
const BUILD_MARKER = 'bigstack-backend-2026-07-16-v2';
// eslint-disable-next-line no-console
console.log(`[startup] build marker: ${BUILD_MARKER}`);

let cachedExpressApp: Express | null = null;
let bootstrapPromise: Promise<Express> | null = null;

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

  // Ensure Mongoose is fully connected before we cache the app.
  // We first try to get the connection via Nest's DI token (the normal path
  // when MongooseModule.forRoot() is set up in AppModule). If that ever
  // returns a connection that isn't ready, we wait on it. As a final safety
  // net, if `mongoose.connection` is somehow undefined, we kick off an
  // explicit connect() so the rest of the app has a live connection.
  const mongooseConn = app.get<Connection>(getConnectionToken());

  // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  // eslint-disable-next-line no-console
  console.log(`[bootstrap] Nest connection token readyState: ${mongooseConn?.readyState}`);

  if (!mongooseConn || mongooseConn.readyState !== 1) {
    const connectPromise = (mongooseConn ?? mongooseConnection).asPromise();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `Mongoose failed to connect within 12s (readyState=${mongooseConn?.readyState}). ` +
                `Check MONGO_URI env var and Atlas IP allowlist.`,
            ),
          ),
        12_000,
      ),
    );

    try {
      await Promise.race([connectPromise, timeoutPromise]);
    } catch (err) {
      // Last-ditch effort: if the Nest token returned nothing usable, try a
      // direct mongoose.connect() with the configured URI.
      const uri = process.env.MONGO_URI ?? 'mongodb://localhost:27017/bigstack_management';
      // eslint-disable-next-line no-console
      console.warn(`[bootstrap] Nest connection failed, falling back to direct mongoose.connect()`);
      await Promise.race([
        mongooseConnect(uri, { serverSelectionTimeoutMS: 10_000 }),
        timeoutPromise,
      ]);
    }
  }

  // eslint-disable-next-line no-console
  console.log(`[bootstrap] Mongoose readyState after wait: ${mongooseConnection.readyState}`);

  await app.init();
  return expressApp;
}

function getApp(): Promise<Express> {
  if (cachedExpressApp) return Promise.resolve(cachedExpressApp);
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrapServer()
      .then((app) => {
        cachedExpressApp = app;
        return app;
      })
      .catch((err) => {
        // Reset so the next request can retry the bootstrap instead of being
        // permanently stuck on a failed connection.
        bootstrapPromise = null;
        throw err;
      });
  }
  return bootstrapPromise;
}

export default async function handler(req: any, res: any) {
  try {
    const app = await getApp();
    app(req, res);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[handler] bootstrap failed:', err);
    res.status(500).json({
      statusCode: 500,
      message: 'Service initialisation failed',
      details: err instanceof Error ? err.message : String(err),
      path: req.url,
    });
  }
}
