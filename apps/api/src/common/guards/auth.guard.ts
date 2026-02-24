import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

interface JwtPayload {
  sub: string;
  role: 'ADMIN' | 'STAFF' | 'USER' | 'SUPER_ADMIN';
  tenantId: string;
  tenantSlug: string;
  exp: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    // Mock implementation for Phase 1 hardening
    // In production, use @nestjs/jwt JwtService.verify()
    const token = authHeader.split(' ')[1];

    // Simulate a decoded payload
    const mockPayload: JwtPayload = this.decodeMockToken(token);

    // 1. Signature & Expiration Check (Simulation)
    if (mockPayload.exp < Date.now()) {
      throw new UnauthorizedException('Token has expired');
    }

    // 2. RBAC Check (Only ADMIN or STAFF can access admin routes)
    const allowedRoles = ['ADMIN', 'STAFF'];
    if (!allowedRoles.includes(mockPayload.role)) {
      throw new ForbiddenException('Insufficient permissions: RBAC failure');
    }

    // 3. Tenant Isolation (Trusted Claim Match)
    // We use the tenantSlug from the TOKEN, not just the path or header.
    const tenantSlugInPath = request.params.tenantSlug;

    if (
      tenantSlugInPath &&
      mockPayload.tenantSlug !== tenantSlugInPath &&
      mockPayload.role !== 'SUPER_ADMIN'
    ) {
      throw new ForbiddenException(
        'Tenant mismatch: Access denied for this resource',
      );
    }

    // Attach trusted identity to request
    request.user = mockPayload;

    return true;
  }

  private decodeMockToken(token: string): JwtPayload {
    // Simulation: token format is "role:tenantSlug" (e.g. "ADMIN:my-store")
    const [role, tenantSlug] = token.split(':');
    return {
      sub: 'user-123',
      role: (role as any) || 'USER',
      tenantSlug: tenantSlug || 'unknown',
      tenantId: 'tenant-uuid-123',
      exp: Date.now() + 3600000, // +1 hour
    };
  }
}
