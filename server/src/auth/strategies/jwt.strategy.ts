import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AdminService } from 'src/admin/admin.service';
import {
  createFullPermissions,
  normalizePermissions,
} from 'src/admin/permissions/permission.constants';
import jwtConfig from '../config/jwt.config';
import { AuthJwtPayload } from '../types/auth-jwtPayload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly adminService: AdminService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: String(jwtConfiguration.secret ?? ''),
    });
  }

  async validate(payload: AuthJwtPayload) {
    const role = String(payload.role ?? '');

    if (role === 'admin' || role === 'super_admin') {
      const admin = await this.adminService.findAdminById(String(payload.sub));
      if (!admin || !admin.isActive) {
        throw new UnauthorizedException('حساب ادمین معتبر نیست');
      }

      const permissions =
        admin.role === 'super_admin'
          ? createFullPermissions()
          : normalizePermissions(admin.permissions);

      return {
        sub: admin.id,
        role: admin.role,
        username: admin.username,
        permissions,
      };
    }

    return payload;
  }
}
