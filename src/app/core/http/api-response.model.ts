import { ValidationErrorDetail } from '../error/app-error';

export interface ApiSuccessResponse<T> {
  readonly success: true;
  readonly data: T;
  readonly meta?: {
    readonly page?: number;
    readonly pageSize?: number;
    readonly totalItems?: number;
    readonly totalPages?: number;
  };
}

export interface ApiErrorResponse {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: readonly ValidationErrorDetail[];
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
