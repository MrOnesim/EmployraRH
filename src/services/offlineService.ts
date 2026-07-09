import api from '../lib/axios';
import { offlineDB } from '../utils/db';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

interface SyncAction {
  id?: number;
  action: {
    method: HttpMethod;
    url: string;
    data?: unknown;
    params?: Record<string, unknown>;
  };
  timestamp: string;
  status: string;
}

async function isOnline(): Promise<boolean> {
  if (!navigator.onLine) return false;
  try {
    const resp = await fetch(`${api.defaults.baseURL}/health`, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
    return resp.ok;
  } catch {
    return false;
  }
}

export const offlineApi = {
  async get<T>(cacheKey: string, url: string, params?: Record<string, unknown>): Promise<T> {
    try {
      if (navigator.onLine) {
        const { data } = await api.get(url, { params });
        await offlineDB.set(cacheKey, { data, cachedAt: Date.now() });
        return data;
      }
      throw new Error('offline');
    } catch (err: any) {
      if (!navigator.onLine || err?.message === 'offline') {
        const cached = await offlineDB.get(cacheKey);
        if (cached) return cached.data as T;
      }
      throw err;
    }
  },

  async mut<T>(method: 'post' | 'put' | 'patch' | 'delete', url: string, data?: unknown): Promise<T> {
    try {
      if (navigator.onLine) {
        const { data: response } = await api[method](url, data);
        return response;
      }
      throw new Error('offline');
    } catch (err: any) {
      if (!navigator.onLine || err?.message === 'offline') {
        await offlineDB.addToSyncQueue({ method, url, data });
        throw new Error('Action queued for sync when back online');
      }
      throw err;
    }
  },

  async post<T>(url: string, data?: unknown): Promise<T> {
    return this.mut<T>('post', url, data);
  },

  async put<T>(url: string, data?: unknown): Promise<T> {
    return this.mut<T>('put', url, data);
  },

  async patch<T>(url: string, data?: unknown): Promise<T> {
    return this.mut<T>('patch', url, data);
  },

  async del<T>(url: string): Promise<T> {
    return this.mut<T>('delete', url);
  },

  async processSyncQueue(): Promise<{ synced: number; failed: number }> {
    const queue = (await offlineDB.getSyncQueue()) as SyncAction[];
    let synced = 0;
    let failed = 0;
    for (const item of queue) {
      try {
        await api[item.action.method](item.action.url, item.action.data, { params: item.action.params } as any);
        synced++;
      } catch {
        failed++;
      }
    }
    if (synced > 0) {
      await offlineDB.set('sync', []);
    }
    return { synced, failed };
  },
};

let syncListener: (() => void) | null = null;

export function startSyncListener() {
  if (syncListener) return;
  syncListener = async () => {
    if (navigator.onLine) {
      await offlineApi.processSyncQueue();
    }
  };
  window.addEventListener('online', syncListener);
  window.addEventListener('focus', syncListener);
}

export function stopSyncListener() {
  if (syncListener) {
    window.removeEventListener('online', syncListener);
    window.removeEventListener('focus', syncListener);
    syncListener = null;
  }
}
