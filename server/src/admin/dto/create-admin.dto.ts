import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import {
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
  type AdminPermissionsMap,
  type PermissionAction,
  type PermissionResource,
} from '../permissions/permission.constants';

class ResourcePermissionsDto {
  @IsOptional()
  @IsBoolean()
  view?: boolean;

  @IsOptional()
  @IsBoolean()
  create?: boolean;

  @IsOptional()
  @IsBoolean()
  edit?: boolean;

  @IsOptional()
  @IsBoolean()
  delete?: boolean;
}

export class CreateAdminDto {
  @IsString()
  @Length(3, 60)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message: 'نام کاربری فقط می‌تواند شامل حروف انگلیسی، عدد، نقطه، خط تیره و زیرخط باشد',
  })
  username!: string;

  @IsString()
  @Length(6, 100)
  password!: string;

  @IsOptional()
  @IsIn(['admin', 'super_admin'])
  role?: 'admin' | 'super_admin';

  @IsOptional()
  @IsString()
  @Length(1, 120)
  displayName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(8, 40)
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  avatarUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  permissions?: AdminPermissionsMap;
}

export class UpdateAdminDto {
  @IsOptional()
  @IsString()
  @Length(3, 60)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message: 'نام کاربری فقط می‌تواند شامل حروف انگلیسی، عدد، نقطه، خط تیره و زیرخط باشد',
  })
  username?: string;

  @IsOptional()
  @IsString()
  @Length(6, 100)
  password?: string;

  @IsOptional()
  @IsIn(['admin', 'super_admin'])
  role?: 'admin' | 'super_admin';

  @IsOptional()
  @IsString()
  @Length(1, 120)
  displayName?: string | null;

  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsOptional()
  @IsString()
  @Length(8, 40)
  phone?: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  avatarUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  permissions?: AdminPermissionsMap;
}

export class UpdateAdminProfileDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  displayName?: string | null;

  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsOptional()
  @IsString()
  @Length(8, 40)
  phone?: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  avatarUrl?: string | null;

  @IsOptional()
  @IsString()
  @Length(6, 100)
  currentPassword?: string;

  @IsOptional()
  @IsString()
  @Length(6, 100)
  newPassword?: string;
}

export function assertValidPermissionsShape(permissions?: AdminPermissionsMap) {
  if (!permissions) return;

  for (const key of Object.keys(permissions)) {
    if (!(PERMISSION_RESOURCES as readonly string[]).includes(key)) {
      throw new Error(`منبع دسترسی نامعتبر: ${key}`);
    }
    const actions = permissions[key as PermissionResource];
    if (!actions) continue;
    for (const action of Object.keys(actions)) {
      if (!(PERMISSION_ACTIONS as readonly string[]).includes(action)) {
        throw new Error(`عملیات دسترسی نامعتبر: ${action}`);
      }
      const typedAction = action as PermissionAction;
      if (typeof actions[typedAction] !== 'boolean' && typeof actions[typedAction] !== 'undefined') {
        throw new Error(`مقدار دسترسی نامعتبر برای ${key}.${action}`);
      }
    }
  }
}
