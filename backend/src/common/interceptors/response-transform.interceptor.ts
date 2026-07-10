import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: { page: number; limit: number; total: number };
  timestamp: string;
}

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, SuccessResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<SuccessResponse<T>> {
    const now = new Date().toISOString();
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'meta' in data && 'data' in data) {
          return { success: true, data: data.data, meta: data.meta, timestamp: now };
        }
        if (data && typeof data === 'object' && 'success' in data && 'timestamp' in data) {
          return data;
        }
        return { success: true, data, timestamp: now };
      }),
    );
  }
}
