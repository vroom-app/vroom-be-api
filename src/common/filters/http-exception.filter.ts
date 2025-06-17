import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorDto } from '../dto/error.dto';
import { ApiResponse } from '../interfaces/api-response.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let errorDto: ErrorDto;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as
        | string
        | { message?: string | string[]; error?: string };

      // Extract code & message sensibly
      errorDto = {
        code: (res as any).error || exception.name,
        message:
          typeof res === 'string'
            ? res
            : Array.isArray(res.message)
              ? res.message.join(', ')
              : res.message || exception.message,
      };
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorDto = {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred.',
      };
    }

    const apiResponse: ApiResponse<null> = {
      success: false,
      error: errorDto,
    };

    response.status(status).json(apiResponse);
  }
}
