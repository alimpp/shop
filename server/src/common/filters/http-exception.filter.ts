import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
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
