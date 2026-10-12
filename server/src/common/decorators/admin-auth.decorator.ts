import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth/jwt-auth.guard';
import type {
  PermissionAction,
  PermissionResource,
} from '../../admin/permissions/permission.constants';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';
import { RequirePermission } from './require-permission.decorator';

export function AdminAuth(
  resource: PermissionResource,
  action: PermissionAction,
) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard),
    Roles('admin'),
    RequirePermission(resource, action),
  );
}
