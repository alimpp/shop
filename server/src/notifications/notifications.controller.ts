import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { NotificationsService } from './notifications.service';

type AuthenticatedRequest = Request & {
  user: { sub: string; role?: string };
};

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateNotificationDto) {
    return await this.notificationsService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query() query: QueryNotificationsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.notificationsService.findAllForUser(req.user.sub, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  async unreadCount(@Req() req: AuthenticatedRequest) {
    const count = await this.notificationsService.countUnread(req.user.sub);
    return { count };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('seen-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsSeen(@Req() req: AuthenticatedRequest) {
    return await this.notificationsService.markAllAsSeen(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/seen')
  @HttpCode(HttpStatus.OK)
  async markAsSeen(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.notificationsService.markAsSeen(id, req.user.sub);
  }
}
