import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { AdminAuth } from '../common/decorators/admin-auth.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminService } from './admin.service';
import {
  CreateAdminDto,
  UpdateAdminDto,
  UpdateAdminProfileDto,
} from './dto/create-admin.dto';

type AuthenticatedRequest = Request & {
  user: { sub: string; role?: string };
};

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @AdminAuth('admins', 'view')
  @Get('/permissions/catalog')
  getPermissionCatalog() {
    return this.adminService.getPermissionCatalog();
  }

  @AdminAuth('admins', 'view')
  @Get('/all')
  async getAll() {
    return await this.adminService.getAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('/info')
  async getAdmin(@Req() req: AuthenticatedRequest) {
    return await this.adminService.getAdmin(req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('/profile')
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateAdminProfileDto,
  ) {
    return await this.adminService.updateProfile(req.user.sub, dto);
  }

  @AdminAuth('admins', 'create')
  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateAdminDto,
  ) {
    const actor = await this.adminService.findAdminById(req.user.sub);
    return await this.adminService.create(dto, actor);
  }

  @AdminAuth('admins', 'view')
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const admin = await this.adminService.getAdmin(id);
    return admin;
  }

  @AdminAuth('admins', 'edit')
  @Patch(':id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdminDto,
  ) {
    const actor = await this.adminService.findAdminById(req.user.sub);
    return await this.adminService.update(id, dto, actor);
  }

  @AdminAuth('admins', 'delete')
  @Delete(':id')
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const actor = await this.adminService.findAdminById(req.user.sub);
    return await this.adminService.remove(id, actor);
  }
}
