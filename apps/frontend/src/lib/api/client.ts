import axios from 'axios';

const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
const baseURL =
  configured && configured.length > 0 ? configured : '/api/v1';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const reqUrl = (error.config?.url as string) || '';
      const skipRedirect =
        reqUrl.includes('/users/profile') ||
        reqUrl.includes('/auth/login') ||
        reqUrl.includes('/auth/register') ||
        reqUrl.includes('/auth/logout');

      if (!skipRedirect) {
        try {
          await apiClient.post('/auth/logout');
        } catch {
          /* ignore */
        }
        const path = window.location.pathname;
        if (!path.startsWith('/login') && !path.startsWith('/register')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
