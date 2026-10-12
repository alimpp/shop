import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  hasPermission,
  type PermissionAction,
  type PermissionResource,
} from '../../admin/permissions/permission.constants';
import {
  PERMISSION_KEY,
  type RequiredPermissionMeta,
} from '../decorators/require-permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<RequiredPermissionMeta>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as
      | {
          role?: string;
          permissions?: Record<string, Partial<Record<PermissionAction, boolean>>>;
        }
      | undefined;

    if (!user) {
      throw new ForbiddenException('ابتدا وارد حساب کاربری شوید');
    }

    const isSuperAdmin = user.role === 'super_admin';
    const allowed = hasPermission(
      user.permissions,
      required.resource as PermissionResource,
      required.action,
      isSuperAdmin,
    );

    if (!allowed) {
      throw new ForbiddenException('شما دسترسی لازم برای این عملیات را ندارید');
    }

    return true;
  }
}
