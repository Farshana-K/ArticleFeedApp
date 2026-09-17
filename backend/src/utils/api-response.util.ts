import { ApiErrorResponse, ApiSuccessResponse } from '../types/api-response.types';

export function successResponse<T>(message: string, data?: T): ApiSuccessResponse<T> {
  return {
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
  };
}

export function errorResponse(message: string, errors?: unknown[]): ApiErrorResponse {
  return {
    success: false,
    message,
    ...(errors !== undefined ? { errors } : {}),
  };
}
 