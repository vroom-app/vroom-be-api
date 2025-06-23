import { MetaDto } from '../dto/meta.dto';
import { ErrorDto } from '../dto/error.dto';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: MetaDto;
  error?: ErrorDto;
}
