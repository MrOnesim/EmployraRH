import axios, { AxiosError } from 'axios';
import { offlineDB } from '../utils/db';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase();
    if (method === 'get' && response.config.url) {
      const cacheKey = `api:${response.config.url}:${JSON.stringify(response.config.params || {})}`;
      offlineDB.set(cacheKey, { data: response.data, cachedAt: Date.now() });
    }
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    const method = config.method?.toLowerCase();
    if (!navigator.onLine || error.code === 'ERR_NETWORK') {
      if (method === 'get' && config.url) {
        const cacheKey = `api:${config.url}:${JSON.stringify(config.params || {})}`;
        const cached = await offlineDB.get(cacheKey);
        if (cached) return Promise.resolve({ data: cached.data } as any);
      }
      if (method && ['post', 'put', 'patch', 'delete'].includes(method)) {
        await offlineDB.addToSyncQueue({ method, url: config.url, data: config.data });
        return Promise.reject(new Error('Action enregistrée hors ligne. Synchronisation automatique dès que la connexion sera rétablie.'));
      }
    }
    return Promise.reject(error);
  },
);

export function startOfflineSync() {
  const sync = async () => {
    if (!navigator.onLine) return;
    const queue = await offlineDB.getSyncQueue() as any[];
    for (const item of queue) {
      try {
        await api[item.action.method as 'post' | 'put' | 'patch' | 'delete'](item.action.url, item.action.data);
      } catch { /* skip failed sync items */ }
    }
    if (queue.length > 0) {
      offlineDB.clearSyncQueue();
    }
  };
  window.addEventListener('online', sync);
  window.addEventListener('focus', sync);
}

export default api;
