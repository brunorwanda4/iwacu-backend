import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // Log request
    this.logger.log(`[${method}] ${originalUrl} - ${ip} - ${userAgent}`);

    // Capture response
    const originalSend = res.send;
    const logger = this.logger;
    res.send = function (data: any) {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      // Log response
      logger.log(
        `[${method}] ${originalUrl} - ${statusCode} - ${duration}ms`,
      );

      // Call original send
      return originalSend.call(this, data);
    };

    next();
  }
}
