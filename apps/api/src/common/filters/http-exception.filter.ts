import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<{
      status: (code: number) => { json: (payload: unknown) => void };
    }>();
    const request = ctx.getRequest<{ url: string }>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const errorResponse = exception.getResponse() as
        | string
        | { message?: string | string[]; error?: string };

      const message =
        typeof errorResponse === 'string'
          ? errorResponse
          : Array.isArray(errorResponse?.message)
            ? errorResponse.message.join(', ')
            : (errorResponse?.message ?? exception.message);

      response.status(status).json({
        success: false,
        statusCode: status,
        message,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Beklenmeyen bir sunucu hatası oluştu.',
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
