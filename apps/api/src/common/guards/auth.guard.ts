import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  tenantSlug: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'gridiron_secret_unsecure_dev_only',
      });

      // Attach trusted payload to request
      request['user'] = payload;

      // 1. RBAC Check (Only ADMIN, STAFF, or SUPER_ADMIN)
      const allowedRoles = ['ADMIN', 'STAFF', 'SUPER_ADMIN'];
      const hasRole = payload.roles.some((role) => allowedRoles.includes(role));

      if (!hasRole) {
        throw new ForbiddenException('Insufficient permissions: RBAC failure');
      }

      // 2. Tenant Isolation
      const tenantSlugInPath = request.params.tenantSlug;

      // Bypass tenant check if SUPER_ADMIN
      const isSuperAdmin = payload.roles.includes('SUPER_ADMIN');

      if (
        tenantSlugInPath &&
        !isSuperAdmin &&
        payload.tenantSlug !== tenantSlugInPath
      ) {
        throw new ForbiddenException('Tenant mismatch: Access denied');
      }
    } catch (e) {
      if (e instanceof ForbiddenException) throw e;
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
