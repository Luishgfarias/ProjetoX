import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL, API_TIMEOUT_MS } from "../constants/api";
import {
  DEFAULT_MAX_ATTEMPTS,
  DEFAULT_RETRY_DELAY_MS,
} from "../constants/retry";

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  retryAttempt?: number;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableRequestConfig | undefined;
    const currentAttempt = config?.retryAttempt ?? 1;

    if (config && currentAttempt < DEFAULT_MAX_ATTEMPTS) {
      config.retryAttempt = currentAttempt + 1;
      await new Promise((resolve) => {
        setTimeout(resolve, DEFAULT_RETRY_DELAY_MS * currentAttempt);
      });
      return api(config);
    }

    if (error.response) {
      console.error(
        "API response error:",
        error.response.status,
        error.response.data,
      );
    } else if (error.request) {
      console.error("API request error:", error.request);
    } else {
      console.error("API setup error:", error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
export { API_BASE_URL, API_TIMEOUT_MS };
