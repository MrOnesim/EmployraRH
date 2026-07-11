import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { IoredisStore } from './ioredis.store';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => {
        const store = new IoredisStore(process.env.REDIS_URL);
        return {
          stores: [store],
          ttl: 30_000,
          max: 100,
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class AppCacheModule {}
