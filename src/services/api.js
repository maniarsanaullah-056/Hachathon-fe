import axios from 'axios';

const TOKEN_KEY = 'hcm_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthCall = url.startsWith('/auth/login') || url.startsWith('/setup');

    if (status === 401 && !isAuthCall) {
      clearToken();
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    if (status === 403 && error.response?.data?.code === 'PASSWORD_CHANGE_REQUIRED') {
      window.dispatchEvent(new Event('auth:password-change-required'));
    }
    return Promise.reject(error);
  }
);

// Backend response { success, message, data } mein se sirf data nikalta hai
export const unwrap = (promise) => promise.then((res) => res.data.data);

export default api;
