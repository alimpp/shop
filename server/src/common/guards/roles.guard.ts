import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

const ADMIN_PANEL_ROLES = new Set(['admin', 'super_admin']);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('ابتدا وارد حساب کاربری شوید');
    }

    const userRole = String(user.role ?? '');
    const hasRole = requiredRoles.some((role) => {
      if (role === 'admin') {
        return ADMIN_PANEL_ROLES.has(userRole);
      }
      return role === userRole;
    });

    if (!hasRole) {
      throw new ForbiddenException('شما دسترسی لازم را ندارید');
    }

    return true;
  }
}
