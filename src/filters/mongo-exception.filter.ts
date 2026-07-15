import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, HttpException } from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // The `unknown` narrowing dance — we accept `any` at the boundary
    // because the entire point of this filter is to handle arbitrary errors.
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
    const err = exception as {
      code?: number | string;
      keyValue?: Record<string, unknown>;
      errorResponse?: { code?: number | string; keyValue?: Record<string, unknown> };
      message?: string;
    };

    // Handle Mongo duplicate key error (E11000)
    const code = err.code || err.errorResponse?.code;
    if (code === 11000 || code === '11000') {
      const keyValue = err.keyValue || err.errorResponse?.keyValue || {};
      const field = Object.keys(keyValue)[0] || 'field';
      const value = keyValue[field];
      const message = value ? `Duplicate ${field}: ${String(value)}` : 'Duplicate key error';
      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message,
        error: 'Conflict',
        path: request.url,
      });
      return;
    }
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */

    // If it's already an HttpException, preserve its response
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      response.status(status).json({
        statusCode: status,
        ...(typeof res === 'object' ? res : { message: res }),
        path: request.url,
      });
      return;
    }

    // Fallback to generic 500 with useful debug info
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    response.status(status).json({
      statusCode: status,
      message: 'Internal server error',
      details: (err as { message?: string }).message ?? null,
      path: request.url,
    });
  }
}
