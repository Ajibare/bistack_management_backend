import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, HttpException } from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Handle Mongo duplicate key error (E11000)
    const code = exception?.code || exception?.errorResponse?.code;
    if (code === 11000 || code === '11000') {
      const keyValue = exception.keyValue || exception.errorResponse?.keyValue || {};
      const field = Object.keys(keyValue)[0] || 'field';
      const value = keyValue[field];
      const message = value ? `Duplicate ${field}: ${value}` : 'Duplicate key error';
      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message,
        error: 'Conflict',
        path: request.url,
      });
      return;
    }

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
      details: exception?.message || null,
      path: request.url,
    });
  }
}
