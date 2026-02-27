import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import jwksRsa, { JwksClient } from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';

function getJwksUri(): string {
  const dbUrl = process.env.DATABASE_URL || '';
  const match = dbUrl.match(/postgres\.(.*?)\:/);
  const projectId = match ? match[1] : 'mpfqpueldajpmphahezr'; // fallback to our project id
  return `https://${projectId}.supabase.co/auth/v1/.well-known/jwks.json`;
}

const client = new JwksClient({
  jwksUri: getJwksUri(),
  cache: true,
  rateLimit: true,
});

function getKey(header: jwt.JwtHeader): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!header.kid) {
      return reject(new Error('No kid in token header'));
    }
    client.getSigningKey(header.kid, (err, key) => {
      if (err || !key) return reject(err);
      resolve(key.getPublicKey());
    });
  });
}

interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  tenantSlug: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret)
        throw new Error('JWT_SECRET environment variable is required');

      let payload: any;
      const decoded: any = jwt.decode(token, { complete: true });
      if (!decoded) {
        throw new UnauthorizedException('Invalid token format');
      }

      if (decoded.header.alg === 'ES256' || decoded.header.alg === 'RS256') {
        const publicKey = await getKey(decoded.header);
        payload = jwt.verify(token, publicKey, {
          algorithms: ['ES256', 'RS256'],
        });
      } else {
        // Fallback to internal API HS256 token validation
        payload = await this.jwtService.verifyAsync(token, { secret });
      }

      // If the payload lacks roles (e.g., it is a pure Supabase JWT)
      if (!payload.roles) {
        if (!payload.email) {
          throw new UnauthorizedException('Token is missing email claim');
        }
        const user = await this.prisma.user.findUnique({
          where: { email: payload.email },
          include: { managedStores: true },
        });

        if (!user) {
          throw new UnauthorizedException('User not found in database');
        }

        // Attach user info back to the payload to unify logic
        payload.roles = [user.role];
        payload.managedStores = user.managedStores;
      }

      // Attach trusted payload to request
      request['user'] = payload;

      // 1. RBAC Check (Only ADMIN, STAFF, or SUPER_ADMIN)
      const allowedRoles = ['ADMIN', 'STAFF', 'SUPER_ADMIN'];
      const hasRole = payload.roles.some((role: string) =>
        allowedRoles.includes(role),
      );

      if (!hasRole) {
        throw new ForbiddenException('Insufficient permissions: RBAC failure');
      }

      // 2. Tenant Isolation
      const tenantSlugInPath = request.params.tenantSlug;

      // Bypass tenant check if SUPER_ADMIN
      const isSuperAdmin = payload.roles.includes('SUPER_ADMIN');

      if (tenantSlugInPath && !isSuperAdmin) {
        // If it's a legacy or self-signed payload with a direct tenantSlug
        if (payload.tenantSlug) {
          if (
            payload.tenantSlug.toLowerCase() !== tenantSlugInPath.toLowerCase()
          ) {
            throw new ForbiddenException('Tenant mismatch: Access denied');
          }
        }
        // If it's a dynamic payload populated from DB
        else if (payload.managedStores) {
          const hasAccessToTenant = payload.managedStores.some(
            (store: any) =>
              store.slug.toLowerCase() === tenantSlugInPath.toLowerCase(),
          );
          if (!hasAccessToTenant) {
            throw new ForbiddenException(
              'Tenant mismatch: You do not manage this store',
            );
          }
        } else {
          throw new ForbiddenException(
            'Tenant details not available on session',
          );
        }
      }
    } catch (e: any) {
      if (e instanceof ForbiddenException) throw e;
      console.error('[AuthGuard] Verification error:', e);
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
