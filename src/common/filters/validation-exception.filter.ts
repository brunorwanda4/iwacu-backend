import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
  timestamp: string;
  path?: string;
}

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const exceptionResponse = exception.getResponse() as any;

    let errors: Array<{ field?: string; message: string }> | undefined;

    // Extract validation errors if present
    if (exceptionResponse.message && Array.isArray(exceptionResponse.message)) {
      errors = exceptionResponse.message.map((msg: any) => {
        if (typeof msg === 'string') {
          return { message: msg };
        }
        return {
          field: msg.property,
          message: Object.values(msg.constraints || {}).join(', '),
        };
      });
    }

    const errorResponse: ErrorResponse = {
      statusCode: HttpStatus.BAD_REQUEST,
      message: exceptionResponse.message || 'Validation failed',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (errors) {
      errorResponse.errors = errors;
    }

    response.status(HttpStatus.BAD_REQUEST).json(errorResponse);
  }
}
