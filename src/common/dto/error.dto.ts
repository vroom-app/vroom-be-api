import { HttpException, HttpStatus } from '@nestjs/common';

export class ErrorDto {
  readonly code: string;
  readonly message: string;
  readonly details?: any;
}

export class AppException extends HttpException {
  constructor(
    public readonly errorCode: string,
    public readonly message: string,
    status: HttpStatus,
    public readonly details?: any,
  ) {
    super({ errorCode, message, details }, status);
  }
}
