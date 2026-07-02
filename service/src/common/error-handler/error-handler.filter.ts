import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import * as util from 'util';
import { isDev } from '../config/app.config';

export interface ExceptionResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  stack?: string;
  timestamp: string;
  path: string;
  correlationId?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    // Works on BOTH Express & Fastify
    const response: any = ctx.getResponse();
    const request: any = ctx.getRequest();

    const { status, exceptionResponse } = this.getExceptionDetails(exception);

    const formattedResponse: ExceptionResponse = {
      statusCode: status,
      message: exceptionResponse.message,
      error: exceptionResponse.error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (isDev && exception instanceof Error) {
      formattedResponse.stack = exception.stack;
    }

    this.logException(exception, request);

    // Ensure compatibility with both Express and Fastify
    if (typeof response.json === 'function') {
      // Express
      response.status(status).json(formattedResponse);
    } else {
      // Fastify
      response.status(status).send(formattedResponse);
    }
  }

  private getExceptionDetails(exception: unknown): {
    status: number;
    exceptionResponse: { message: string | string[]; error: string };
  } {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const status = exception.getStatus();

      if (typeof response === 'string') {
        return {
          status,
          exceptionResponse: { message: response, error: HttpStatus[status] || 'Http Exception' },
        };
      }

      const responseObj = response as Record<string, any>;

      return {
        status,
        exceptionResponse: {
          message: responseObj.message || 'An error occurred',
          error: responseObj.error || HttpStatus[status] || 'Http Exception',
        },
      };
    }

    if (exception instanceof Error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        exceptionResponse: {
          message: isDev ? exception.message : 'Internal server error',
          error: exception.constructor.name || 'Internal Server Error',
        },
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      exceptionResponse: { message: 'An unexpected error occurred', error: 'Internal Server Error' },
    };
  }

  private logException(exception: unknown, request: any) {
    const errorDetails = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      body: request.body,
      query: request.query,
      params: request.params,
      exception: isDev
        ? util.inspect(exception, { depth: 5 })
        : exception instanceof Error
          ? { name: exception.name, message: exception.message, stack: exception.stack }
          : 'Unknown exception',
    };

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status >= 500) {
        this.logger.error(`HTTP ${status} Error: ${exception.message}`, errorDetails);
      } else {
        this.logger.warn(`HTTP ${status} Client Error: ${exception.message}`, errorDetails);
      }
    } else {
      this.logger.error('Unhandled Exception', errorDetails);
    }
  }
}
