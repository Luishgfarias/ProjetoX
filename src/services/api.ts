import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { DEFAULT_MAX_ATTEMPTS, DEFAULT_RETRY_DELAY_MS } from '../utils/retry';

const API_BASE_URL = 'https://api.spacexdata.com/v4/';
const TIMEOUT_MS = 10000;

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  retryAttempt?: number;
};

function waitForRetry(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRetryDelay(attempt: number): number {
  return DEFAULT_RETRY_DELAY_MS * attempt;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  config => {
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableRequestConfig | undefined;
    const currentAttempt = config?.retryAttempt ?? 1;

    if (config && currentAttempt < DEFAULT_MAX_ATTEMPTS) {
      config.retryAttempt = currentAttempt + 1;
      await waitForRetry(getRetryDelay(currentAttempt));
      return api(config);
    }

    if (error.response) {
      console.error('API response error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('API request error:', error.request);
    } else {
      console.error('API setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL, TIMEOUT_MS };
