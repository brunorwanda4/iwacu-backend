import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

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

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    this.logger.error(`Prisma Error: ${exception.code} - ${exception.message}`);

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An error occurred while processing your request';
    let errors: Array<{ field?: string; message: string }> | undefined;

    // Handle specific Prisma error codes
    switch (exception.code) {
      case 'P2002': // Unique constraint failed
        status = HttpStatus.CONFLICT;
        const target = (exception.meta?.target as string[]) || [];
        message = `A record with this ${target.join(', ')} already exists`;
        errors = target.map((field) => ({
          field,
          message: `${field} must be unique`,
        }));
        break;

      case 'P2025': // Record not found
        status = HttpStatus.NOT_FOUND;
        message = 'The requested resource was not found';
        break;

      case 'P2003': // Foreign key constraint failed
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid reference to related resource';
        break;

      case 'P2014': // Required relation violation
        status = HttpStatus.BAD_REQUEST;
        message = 'Required relation violation';
        break;

      case 'P2000': // Value too long
        status = HttpStatus.BAD_REQUEST;
        message = 'One or more field values are too long';
        break;

      default:
        this.logger.error(`Unhandled Prisma error code: ${exception.code}`);
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (errors) {
      errorResponse.errors = errors;
    }

    response.status(status).json(errorResponse);
  }
}
