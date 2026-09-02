import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { BehaviorService } from './behavior.service';
import { QueryBehaviorDto } from './dto/query-behavior.dto';
import { TrackBehaviorEventDto } from './dto/track-event.dto';

type AuthenticatedRequest = Request & {
  user?: { sub: string; role?: string } | null;
};

@Controller('behavior')
export class BehaviorController {
  constructor(private readonly behaviorService: BehaviorService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Post('events')
  @HttpCode(HttpStatus.CREATED)
  async trackEvent(
    @Body() dto: TrackBehaviorEventDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.behaviorService.trackEvent(dto, req.user?.sub ?? null);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('recent')
  async recent(
    @Query() query: QueryBehaviorDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.behaviorService.getRecentViews(query, req.user?.sub ?? null);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('recommendations')
  async recommendations(
    @Query() query: QueryBehaviorDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.behaviorService.getRecommendations(
      query,
      req.user?.sub ?? null,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/users/:userId')
  async adminUserBehavior(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() query: QueryBehaviorDto,
  ) {
    return this.behaviorService.getAdminUserBehavior(userId, query);
  }
}
