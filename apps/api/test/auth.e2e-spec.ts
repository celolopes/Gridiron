import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  const secret = 'gridiron_secret_unsecure_dev_only';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        tenant: {
          findUnique: jest.fn(),
          findFirst: jest.fn(),
        },
        user: {
          findUnique: jest.fn(),
        },
        checkHealth: jest.fn().mockResolvedValue({ status: 'ok' }),
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
      const expiredToken = jwtService.sign(
        { sub: '123', roles: ['ADMIN'], tenantSlug: 'my-tenant' },
        { expiresInt: '-1h' } as any, // jwtService.sign doesn't take expiresIn easily in some versions, using jsonwebtoken style or options
      );

      // Let's use a real expired token by signing it with 0 exp if possible or just use a helper
      const token = jwtService.sign(
        {
          sub: '123',
          roles: ['ADMIN'],
          tenantSlug: 'my-tenant',
          exp: Math.floor(Date.now() / 1000) - 30,
        },
        { secret },
      );

      return request(app.getHttpServer())
        .get('/admin/my-tenant/diagnostics/db')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
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
        .expect(200);
    });

    it('should pass for SUPER_ADMIN even with tenant mismatch', async () => {
      const token = jwtService.sign(
        { sub: '123', roles: ['SUPER_ADMIN'], tenantSlug: 'central' },
        { secret },
      );

      return request(app.getHttpServer())
        .get('/admin/my-tenant/diagnostics/db')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });
});
