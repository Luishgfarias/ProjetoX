import axios from 'axios';

const API_BASE_URL = 'https://api.spacexdata.com/v5/';
const TIMEOUT_MS = 10000;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  config => {
    // Aqui você pode adicionar cabeçalhos comuns, tokens ou logs.
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  error => {
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
