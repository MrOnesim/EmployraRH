import Redis from 'ioredis';

export interface KeyvStoreAdapter {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttl?: number): Promise<any>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  has?(key: string): Promise<boolean>;
  getMany?(keys: string[]): Promise<any[]>;
  deleteMany?(keys: string[]): Promise<boolean>;
  on?(event: string, listener: (...args: any[]) => void): this;
  disconnect?(): Promise<void>;
}

export class IoredisStore implements KeyvStoreAdapter {
  name = 'ioredis';
  private client: Redis;

  constructor(url?: string) {
    this.client = new Redis(url || process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 2,
      retryStrategy: (times) => (times > 5 ? null : Math.min(times * 200, 2000)),
      lazyConnect: false,
    });

    this.client.on('error', () => {});
  }

  async get(key: string): Promise<any> {
    return this.client.get(key);
  }

  async getMany(keys: string[]): Promise<any[]> {
    if (!keys.length) return [];
    return this.client.mget(...keys);
  }

  async set(key: string, value: any, ttl?: number): Promise<any> {
    if (typeof ttl === 'number' && ttl > 0) {
      return this.client.set(key, value, 'PX', ttl);
    }
    return this.client.set(key, value);
  }

  async delete(key: string): Promise<boolean> {
    return (await this.client.del(key)) > 0;
  }

  async deleteMany(keys: string[]): Promise<boolean> {
    if (!keys.length) return true;
    await this.client.del(...keys);
    return true;
  }

  async clear(): Promise<void> {
    await this.client.flushdb();
  }

  async has(key: string): Promise<boolean> {
    return (await this.client.exists(key)) > 0;
  }

  on(event: string, listener: (...args: any[]) => void): this {
    this.client.on(event, listener);
    return this;
  }

  async disconnect(): Promise<void> {
    this.client.disconnect();
  }
}
