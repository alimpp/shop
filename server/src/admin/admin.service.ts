import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AdminEntity } from 'src/entities/admin.entity';
import { Not, Repository } from 'typeorm';
import {
  assertValidPermissionsShape,
  CreateAdminDto,
  UpdateAdminDto,
  UpdateAdminProfileDto,
} from './dto/create-admin.dto';
import {
  createFullPermissions,
  normalizePermissions,
  PERMISSION_ACTION_LABELS,
  PERMISSION_RESOURCE_LABELS,
  PERMISSION_RESOURCES,
  type AdminPermissionsMap,
} from './permissions/permission.constants';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminEntity)
    private readonly adminRepo: Repository<AdminEntity>,
  ) {}

  async getAll() {
    const admins = await this.adminRepo.find({
      order: { createdAt: 'DESC' },
    });
    return admins.map((admin) => this.toSafeAdmin(admin));
  }

  async getAdmin(id: string) {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) return null;
    return this.toSafeAdmin(admin);
  }

  async findAdmin(username: string, password: string) {
    const admin = await this.adminRepo.findOne({
      where: { username },
    });

    if (!admin || !admin.isActive) {
      return null;
    }

    const matched = await this.verifyPassword(password, admin.password);
    if (!matched) {
      return null;
    }

    // Migrate legacy plaintext passwords to bcrypt on successful login.
    if (!this.isBcryptHash(admin.password)) {
      admin.password = await this.hashPassword(password);
      await this.adminRepo.save(admin);
    }

    return admin;
  }

  async findAdminById(id: string) {
    return await this.adminRepo.findOne({ where: { id } });
  }

  async create(dto: CreateAdminDto, actor?: AdminEntity | null) {
    this.ensureCanManageAdmins(actor);

    const username = dto.username.trim().toLowerCase();
    const exists = await this.adminRepo.exist({ where: { username } });
    if (exists) {
      throw new BadRequestException('این نام کاربری قبلاً ثبت شده است');
    }

    const role = dto.role ?? 'admin';
    if (role === 'super_admin') {
      this.ensureActorIsSuperAdmin(actor);
    }

    let permissions: AdminPermissionsMap;
    try {
      assertValidPermissionsShape(dto.permissions);
      permissions =
        role === 'super_admin'
          ? createFullPermissions()
          : normalizePermissions(dto.permissions);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'ساختار دسترسی‌ها نامعتبر است',
      );
    }

    const entity = this.adminRepo.create({
      username,
      password: await this.hashPassword(dto.password),
      role,
      displayName: dto.displayName?.trim() || null,
      email: dto.email?.trim() || null,
      phone: dto.phone?.trim() || null,
      avatarUrl: dto.avatarUrl?.trim() || null,
      isActive: dto.isActive ?? true,
      permissions,
    });

    const saved = await this.adminRepo.save(entity);
    return this.toSafeAdmin(saved);
  }

  async update(id: string, dto: UpdateAdminDto, actor?: AdminEntity | null) {
    this.ensureCanManageAdmins(actor);

    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException('ادمین یافت نشد');
    }

    if (admin.role === 'super_admin' && actor && actor.id !== admin.id) {
      this.ensureActorIsSuperAdmin(actor);
    }

    if (dto.username) {
      const username = dto.username.trim().toLowerCase();
      const exists = await this.adminRepo.exist({
        where: { username, id: Not(id) },
      });
      if (exists) {
        throw new BadRequestException('این نام کاربری قبلاً ثبت شده است');
      }
      admin.username = username;
    }

    if (dto.password) {
      admin.password = await this.hashPassword(dto.password);
    }

    if (dto.role) {
      if (dto.role === 'super_admin') {
        this.ensureActorIsSuperAdmin(actor);
      }
      if (
        admin.role === 'super_admin' &&
        dto.role !== 'super_admin' &&
        (await this.countSuperAdmins()) <= 1
      ) {
        throw new BadRequestException(
          'حداقل یک ادمین اصلی باید در سیستم باقی بماند',
        );
      }
      admin.role = dto.role;
    }

    if (typeof dto.displayName !== 'undefined') {
      admin.displayName = dto.displayName?.trim() || null;
    }
    if (typeof dto.email !== 'undefined') {
      admin.email = dto.email?.trim() || null;
    }
    if (typeof dto.phone !== 'undefined') {
      admin.phone = dto.phone?.trim() || null;
    }
    if (typeof dto.avatarUrl !== 'undefined') {
      admin.avatarUrl = dto.avatarUrl?.trim() || null;
    }
    if (typeof dto.isActive === 'boolean') {
      if (
        !dto.isActive &&
        admin.role === 'super_admin' &&
        (await this.countSuperAdmins()) <= 1
      ) {
        throw new BadRequestException(
          'نمی‌توان آخرین ادمین اصلی را غیرفعال کرد',
        );
      }
      admin.isActive = dto.isActive;
    }

    if (dto.permissions) {
      try {
        assertValidPermissionsShape(dto.permissions);
        admin.permissions =
          admin.role === 'super_admin'
            ? createFullPermissions()
            : normalizePermissions(dto.permissions);
      } catch (error) {
        throw new BadRequestException(
          error instanceof Error ? error.message : 'ساختار دسترسی‌ها نامعتبر است',
        );
      }
    } else if (admin.role === 'super_admin') {
      admin.permissions = createFullPermissions();
    }

    const saved = await this.adminRepo.save(admin);
    return this.toSafeAdmin(saved);
  }

  async remove(id: string, actor?: AdminEntity | null) {
    this.ensureCanManageAdmins(actor);

    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException('ادمین یافت نشد');
    }

    if (actor?.id === admin.id) {
      throw new BadRequestException('نمی‌توانید حساب خودتان را حذف کنید');
    }

    if (admin.role === 'super_admin') {
      this.ensureActorIsSuperAdmin(actor);
      if ((await this.countSuperAdmins()) <= 1) {
        throw new BadRequestException(
          'حداقل یک ادمین اصلی باید در سیستم باقی بماند',
        );
      }
    }

    await this.adminRepo.remove(admin);
    return { id, deleted: true };
  }

  async updateProfile(id: string, dto: UpdateAdminProfileDto) {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException('ادمین یافت نشد');
    }

    if (typeof dto.displayName !== 'undefined') {
      admin.displayName = dto.displayName?.trim() || null;
    }
    if (typeof dto.email !== 'undefined') {
      admin.email = dto.email?.trim() || null;
    }
    if (typeof dto.phone !== 'undefined') {
      admin.phone = dto.phone?.trim() || null;
    }
    if (typeof dto.avatarUrl !== 'undefined') {
      admin.avatarUrl = dto.avatarUrl?.trim() || null;
    }

    if (dto.newPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException('رمز عبور فعلی الزامی است');
      }
      const matched = await this.verifyPassword(
        dto.currentPassword,
        admin.password,
      );
      if (!matched) {
        throw new BadRequestException('رمز عبور فعلی نادرست است');
      }
      admin.password = await this.hashPassword(dto.newPassword);
    }

    const saved = await this.adminRepo.save(admin);
    return this.toSafeAdmin(saved);
  }

  getPermissionCatalog() {
    return {
      resources: PERMISSION_RESOURCES.map((resource) => ({
        key: resource,
        label: PERMISSION_RESOURCE_LABELS[resource],
      })),
      actions: Object.entries(PERMISSION_ACTION_LABELS).map(([key, label]) => ({
        key,
        label,
      })),
    };
  }

  async ensureLegacyAdminMigrated() {
    const admins = await this.adminRepo.find();
    for (const admin of admins) {
      let dirty = false;

      if (admin.role === 'admin' && (!admin.permissions || !Object.keys(admin.permissions).length)) {
        // First existing admin becomes super_admin with full access.
        if (admins.length === 1 || admin.username === 'golden-admin') {
          admin.role = 'super_admin';
          admin.permissions = createFullPermissions();
          dirty = true;
        } else {
          admin.permissions = normalizePermissions(admin.permissions);
          dirty = true;
        }
      }

      if (admin.role === 'super_admin') {
        admin.permissions = createFullPermissions();
        dirty = true;
      }

      if (dirty) {
        await this.adminRepo.save(admin);
      }
    }
  }

  private async countSuperAdmins() {
    return this.adminRepo.count({
      where: { role: 'super_admin', isActive: true },
    });
  }

  private ensureCanManageAdmins(actor?: AdminEntity | null) {
    if (!actor) return;
    if (actor.role === 'super_admin') return;
    const can = Boolean(actor.permissions?.admins?.create || actor.permissions?.admins?.edit || actor.permissions?.admins?.delete || actor.permissions?.admins?.view);
    // Fine-grained checks happen in PermissionsGuard; this is a safety net for service-level calls.
    if (!can) {
      throw new ForbiddenException('دسترسی مدیریت ادمین‌ها را ندارید');
    }
  }

  private ensureActorIsSuperAdmin(actor?: AdminEntity | null) {
    if (!actor) return;
    if (actor.role !== 'super_admin') {
      throw new ForbiddenException('فقط ادمین اصلی می‌تواند این عملیات را انجام دهد');
    }
  }

  private async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  private isBcryptHash(value: string) {
    return value.startsWith('$2a$') || value.startsWith('$2b$') || value.startsWith('$2y$');
  }

  private async verifyPassword(plain: string, stored: string) {
    if (this.isBcryptHash(stored)) {
      return bcrypt.compare(plain, stored);
    }
    return plain === stored;
  }

  private toSafeAdmin(admin: AdminEntity) {
    const permissions =
      admin.role === 'super_admin'
        ? createFullPermissions()
        : normalizePermissions(admin.permissions);

    return {
      id: admin.id,
      username: admin.username,
      role: admin.role,
      displayName: admin.displayName,
      email: admin.email,
      phone: admin.phone,
      avatarUrl: admin.avatarUrl,
      isActive: admin.isActive,
      permissions,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }
}
