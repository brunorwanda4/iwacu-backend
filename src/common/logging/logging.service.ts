import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface AuditLogEntry {
  timestamp: Date;
  action: string;
  userId?: string;
  resourceType?: string;
  resourceId?: string;
  details?: any;
  result: 'success' | 'failure';
  errorMessage?: string;
}

@Injectable()
export class LoggingService {
  private logger = new Logger('LoggingService');

  constructor(private prisma: PrismaService) {}

  /**
   * Log a message at the specified level
   */
  log(level: LogLevel, message: string, context?: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
        this.logger.debug(logMessage, context);
        break;
      case LogLevel.INFO:
        this.logger.log(logMessage, context);
        break;
      case LogLevel.WARN:
        this.logger.warn(logMessage, context);
        break;
      case LogLevel.ERROR:
        this.logger.error(logMessage, data?.stack, context);
        break;
    }
  }

  /**
   * Log API request
   */
  logRequest(method: string, path: string, statusCode: number, responseTime: number): void {
    const message = `${method} ${path} - ${statusCode} (${responseTime}ms)`;
    this.log(LogLevel.INFO, message, 'HTTP');
  }

  /**
   * Log authentication attempt
   */
  logAuthAttempt(nationalId: string, success: boolean, ipAddress?: string): void {
    const message = `Authentication attempt for National ID: ${nationalId} - ${success ? 'SUCCESS' : 'FAILED'}`;
    this.log(LogLevel.INFO, message, 'AUTH', { ipAddress });
  }

  /**
   * Log authorization failure
   */
  logAuthorizationFailure(citizenId: string, resource: string, ipAddress?: string): void {
    const message = `Authorization failure for citizen ${citizenId} accessing ${resource}`;
    this.log(LogLevel.WARN, message, 'AUTHORIZATION', { ipAddress });
  }

  /**
   * Log sensitive data modification
   */
  logSensitiveModification(
    action: string,
    resourceType: string,
    resourceId: string,
    userId: string,
    details?: any,
  ): void {
    const message = `Sensitive modification: ${action} on ${resourceType} ${resourceId} by user ${userId}`;
    this.log(LogLevel.INFO, message, 'AUDIT', details);
  }

  /**
   * Log service request status change
   */
  logServiceRequestStatusChange(
    requestId: string,
    oldStatus: string,
    newStatus: string,
    userId: string,
  ): void {
    const message = `Service request ${requestId} status changed from ${oldStatus} to ${newStatus} by user ${userId}`;
    this.log(LogLevel.INFO, message, 'SERVICE_REQUEST', { requestId, oldStatus, newStatus });
  }

  /**
   * Log error
   */
  logError(message: string, error: Error, context?: string): void {
    this.log(LogLevel.ERROR, message, context, { stack: error.stack });
  }
}
