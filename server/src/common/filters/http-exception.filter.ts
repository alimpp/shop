import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { captureException } from '../monitoring/sentry';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  private formatMessage(message: unknown): string {
    if (Array.isArray(message)) {
      return message
        .map((item) => String(item).trim())
        .filter(Boolean)
        .join('، ');
    }

    if (typeof message === 'string') {
      return message;
    }

    return 'خطای داخلی سرور';
  }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse();

    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'خطای داخلی سرور';

    if (exception instanceof HttpException) {
      const errorResponse = exception.getResponse();

      if (typeof errorResponse === 'object' && errorResponse['message']) {
        message = this.formatMessage(errorResponse['message']);
      } else if (typeof errorResponse === 'string') {
        message = errorResponse;
      }
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
      captureException(exception, {
        path: request.url,
        method: request.method,
        statusCode: status,
        userId: request.user?.sub ?? null,
      });
    } else if (status >= HttpStatus.BAD_REQUEST) {
      this.logger.warn(
        `${request.method} ${request.url} → ${status}: ${message}`,
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      path: request.url,
      data: null,
      timestamp: new Date(),
    });
  }
}
