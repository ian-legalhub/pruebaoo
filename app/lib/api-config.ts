import axios from 'axios';

const AUTH_API_URL = process.env.NEXT_PUBLIC_LEMON_API_URL;
const FILES_API_URL = process.env.NEXT_PUBLIC_API_URL;

export const auth_api = axios.create({
  baseURL: AUTH_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const files_api = axios.create({
  baseURL: FILES_API_URL,
  withCredentials: true,
});

files_api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const tenant_id = get_tenant_id();
    if (tenant_id) {
      config.headers['tenant-id'] = tenant_id;
    }
  }
  return config;
});

files_api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
      window.location.href = loginUrl;
    }
    return Promise.reject(error);
  }
);

export const get_tenant_id = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('tenantId');
};

export const set_tenant_id = (tenant_id: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('tenantId', tenant_id);
};
