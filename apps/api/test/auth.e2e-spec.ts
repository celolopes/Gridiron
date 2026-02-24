process.env.JWT_SECRET = 'gridiron_secret_unsecure_dev_only';
process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './../src/prisma/prisma.service';
import { AuthModule } from './../src/auth/auth.module';
import { AdminModule } from './../src/admin/admin.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  const secret = process.env.JWT_SECRET;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, AdminModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        checkHealth: jest.fn().mockResolvedValue({
          status: 'ok',
          latency: '5ms',
          metadata: {
            user: 'test-user',
            addr: '127.0.0.1',
            port: 5432,
            version: 'PostgreSQL 15',
          },
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    jwtService = app.get(JwtService);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Admin Routes Protection', () => {
    it('should fail if no token is provided', () => {
      return request(app.getHttpServer())
        .get('/admin/my-tenant/diagnostics/db')
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('Missing authentication token');
        });
    });

    it('should fail if token is invalid (bad signature)', () => {
      return request(app.getHttpServer())
        .get('/admin/my-tenant/diagnostics/db')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('Invalid or expired token');
        });
    });

    it('should fail if token is expired', async () => {
      const token = jwtService.sign(
        {
          sub: '123',
          roles: ['ADMIN'],
          tenantSlug: 'my-tenant',
        },
        { secret, expiresIn: '-30s' },
      );

      return request(app.getHttpServer())
        .get('/admin/my-tenant/diagnostics/db')
        .set('Authorization', `Bearer ${token}`)
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('Invalid or expired token');
        });
    });

    it('should fail if user has wrong role (CUSTOMER)', async () => {
      const token = jwtService.sign(
        { sub: '123', roles: ['CUSTOMER'], tenantSlug: 'my-tenant' },
        { secret },
      );

      return request(app.getHttpServer())
        .get('/admin/my-tenant/diagnostics/db')
        .set('Authorization', `Bearer ${token}`)
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Insufficient permissions: RBAC failure',
          );
        });
    });

    it('should fail if tenant mismatch', async () => {
      const token = jwtService.sign(
        { sub: '123', roles: ['ADMIN'], tenantSlug: 'other-tenant' },
        { secret },
      );

      return request(app.getHttpServer())
        .get('/admin/my-tenant/diagnostics/db')
        .set('Authorization', `Bearer ${token}`)
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toBe('Tenant mismatch: Access denied');
        });
    });

    it('should pass if token is valid and tenant matches', async () => {
      const token = jwtService.sign(
        { sub: '123', roles: ['ADMIN'], tenantSlug: 'my-tenant' },
        { secret },
      );

      return request(app.getHttpServer())
        .get('/admin/my-tenant/diagnostics/db')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.database.status).toBe('ok');
          expect(res.body.tenant).toBe('my-tenant');
        });
    });

    it('should pass for SUPER_ADMIN even with tenant mismatch', async () => {
      const token = jwtService.sign(
        { sub: '123', roles: ['SUPER_ADMIN'], tenantSlug: 'central' },
        { secret },
      );

      return request(app.getHttpServer())
        .get('/admin/my-tenant/diagnostics/db')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.database.status).toBe('ok');
        });
    });
  });
});
