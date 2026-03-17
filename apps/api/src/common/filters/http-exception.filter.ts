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

    const errorMessage =
      exception instanceof Error
        ? exception.message
        : typeof exception === 'string'
          ? exception
          : undefined;

    if (exception instanceof Error) {
      // Log full stack for unexpected errors to speed up debugging in dev.

      console.error(exception.stack ?? exception);
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message:
        process.env.NODE_ENV === 'production'
          ? 'Beklenmeyen bir sunucu hatası oluştu.'
          : (errorMessage ?? 'Beklenmeyen bir sunucu hatası oluştu.'),
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
