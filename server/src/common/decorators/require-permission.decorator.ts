import { SetMetadata } from '@nestjs/common';
import type {
  PermissionAction,
  PermissionResource,
} from '../../admin/permissions/permission.constants';

export const PERMISSION_KEY = 'required_permission';

export type RequiredPermissionMeta = {
  resource: PermissionResource;
  action: PermissionAction;
};

export const RequirePermission = (
  resource: PermissionResource,
  action: PermissionAction,
) => SetMetadata(PERMISSION_KEY, { resource, action } satisfies RequiredPermissionMeta);
