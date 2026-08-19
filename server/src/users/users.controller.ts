import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminUsersService } from './admin-users.service';
import { CreateDto } from './dto/createUser.dto';
import { QueryAdminUsersDto } from './dto/query-admin-users.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UsersService } from './users.service';

type AuthenticatedRequest = Request & {
  user: { sub: string; role?: string };
};

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly adminUsersService: AdminUsersService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin')
  async findAllAdmin(@Query() query: QueryAdminUsersDto) {
    return await this.adminUsersService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/:id')
  async getAdminOverview(@Param('id', ParseUUIDPipe) id: string) {
    return await this.adminUsersService.getOverview(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/:id/cart')
  async getAdminCart(@Param('id', ParseUUIDPipe) id: string) {
    return await this.adminUsersService.getCart(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/:id/orders')
  async getAdminOrders(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: QueryAdminUsersDto,
  ) {
    return await this.adminUsersService.getOrders(
      id,
      query.page,
      query.limit,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/:id/favorites')
  async getAdminFavorites(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: QueryAdminUsersDto,
  ) {
    return await this.adminUsersService.getFavorites(
      id,
      query.page,
      query.limit,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/:id/likes')
  async getAdminLikes(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: QueryAdminUsersDto,
  ) {
    return await this.adminUsersService.getLikes(id, query.page, query.limit);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/:id/comments')
  async getAdminComments(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: QueryAdminUsersDto,
  ) {
    return await this.adminUsersService.getComments(
      id,
      query.page,
      query.limit,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/:id/addresses')
  async getAdminAddresses(@Param('id', ParseUUIDPipe) id: string) {
    return await this.adminUsersService.getAddresses(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('admin/:id/chat')
  async getAdminChat(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.adminUsersService.getOrCreateChat(id, req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('/all')
  async getAllUsers() {
    return await this.usersService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getUserProfile(@Req() req: AuthenticatedRequest) {
    const user = await this.usersService.getUserById(req.user.sub);
    if (!user)
      throw new NotFoundException(
        `This user with id ${req.user.sub} not found`,
      );
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.getUserById(id);
    if (!user) throw new NotFoundException(`This user with id ${id} not found`);
    return user;
  }

  @Post('/register')
  async register(@Body() body: CreateDto) {
    return await this.usersService.createUser(body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/update')
  async update(@Req() req: AuthenticatedRequest, @Body() body: UpdateUserDto) {
    return await this.usersService.updateUser(req.user.sub, body);
  }
}
