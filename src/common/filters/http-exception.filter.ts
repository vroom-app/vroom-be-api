import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { AppException, ErrorDto } from '../dto/error.dto';
import { ApiResponse } from '../interfaces/api-response.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { status, errorDto } = this.handleException(exception);

    const apiResponse: ApiResponse<null> = {
      success: false,
      error: errorDto,
    };

    response.status(status).json(apiResponse);
  }

  private handleException(exception: unknown): { status: number; errorDto: ErrorDto } {
    if (exception instanceof AppException) {
      return this.handleAppException(exception);
    } else if (exception instanceof HttpException || exception instanceof NotFoundException) {
      return this.handleHttpException(exception);
    } else {
      return this.handleUnknownException(exception);
    }
  }

  private handleAppException(exception: AppException): { status: number; errorDto: ErrorDto } {
    const status = exception.getStatus();
    const errorDto: ErrorDto = {
      code: exception.errorCode,
      message: exception.message,
      details: exception.details,
    };

    return { status, errorDto };
  }

  private handleHttpException(exception: HttpException | NotFoundException): { status: number; errorDto: ErrorDto } {
    const status = exception.getStatus();
    const response = exception.getResponse() as
      | string
      | { message?: string | string[]; error?: string; details?: any };

    const errorDto = this.extractErrorDtoFromResponse(response, exception);

    return { status, errorDto };
  }

  private extractErrorDtoFromResponse(
    response: string | { message?: string | string[]; error?: string; details?: any },
    exception: HttpException | NotFoundException,
  ): ErrorDto {
    if (typeof response === 'string') {
      return {
        code: exception.name,
        message: response,
      };
    }

    return {
      code: (response as any).error || exception.name,
      message: this.extractMessageFromResponse(response, exception),
      details: response.details,
    };
  }

  private extractMessageFromResponse(
    response: { message?: string | string[]; error?: string },
    exception: HttpException | NotFoundException,
  ): string {
    if (Array.isArray(response.message)) {
      return response.message.join(', ');
    }
    
    return response.message || exception.message;
  }

  private handleUnknownException(exception: unknown): { status: number; errorDto: ErrorDto } {
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const errorDto: ErrorDto = {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    };

    console.error('Unhandled exception:', exception);

    return { status, errorDto };
  }
}