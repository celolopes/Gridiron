import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // For multi-tenant, we might need to get the tenant slug for this user
    // For now, let's assume we lookup a tenant the user belongs to or pass it in
    // This part depends on the multi-tenant architecture details
    const tenant = await this.prisma.tenant.findFirst({
      // In a real app, users would be linked to tenants (UserTenant table etc)
      // For MVP/Phase 1 hardening, we'll assume a simplified lookup
      // or just use a default for testing
    });

    const payload = {
      sub: user.id,
      email: user.email,
      roles: [user.role],
      tenantSlug: tenant?.slug || 'default',
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
