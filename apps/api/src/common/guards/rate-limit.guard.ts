import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

const REQUESTS_LIMIT = 10;
const WINDOW_SIZE = 60000; // 1 minute

// TODO: Implement RedisRateLimitStore for production
// interface RateLimitStore {
//   get(key: string): Promise<{ count: number; startTime: number } | undefined> | { count: number; startTime: number } | undefined;
//   set(key: string, value: { count: number; startTime: number }): Promise<void> | void;
// }

const stores: Record<string, { count: number; startTime: number }> = {};

@Injectable()
export class SimpleRateLimitGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    const now = Date.now();

    if (!stores[ip]) {
      stores[ip] = { count: 1, startTime: now };
      return true;
    }

    const elapsed = now - stores[ip].startTime;

    if (elapsed > WINDOW_SIZE) {
      stores[ip] = { count: 1, startTime: now };
      return true;
    }

    if (stores[ip].count >= REQUESTS_LIMIT) {
      throw new HttpException(
        'Rate limit exceeded',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    stores[ip].count++;
    return true;
  }
}
