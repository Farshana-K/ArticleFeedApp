import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

interface RetryRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetryRequest | undefined;

    if (
      error.response?.status !== 401 ||
      !request ||
      request._retry ||
      request.url?.includes('/auth/refresh') ||
      request.url?.includes('/auth/login')
    ) {
      return Promise.reject(error);
    }

    request._retry = true;

    try {
      await api.post('/auth/refresh');
      return api(request);
    } catch {
      return Promise.reject(error);
    }
  },
);