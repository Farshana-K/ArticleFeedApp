import axios from 'axios';

interface ApiErrorResponse {
  message?: string;
  errors?: Array<Array<{ path?: string; message?: string }>>;
}

export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) return 'Something went wrong';

  const data = error.response?.data as ApiErrorResponse | undefined;
  const validationError = data?.errors?.[0]?.[0]?.message;

  return validationError ?? data?.message ?? 'Something went wrong';
}