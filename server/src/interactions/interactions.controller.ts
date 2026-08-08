import {
  Body,
  Controller,
  Delete,
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { LikeStatusQueryDto } from './dto/like-status-query.dto';
import { LikeToggleDto } from './dto/like-toggle.dto';
import { QueryCommentsDto } from './dto/query-comments.dto';
import { InteractionsService } from './interactions.service';

type AuthenticatedRequest = Request & {
  user: { sub: string; role?: string };
};

@Controller()
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('likes/toggle')
  @HttpCode(HttpStatus.OK)
  async toggleLike(
    @Body() dto: LikeToggleDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.interactionsService.toggleLike(dto, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('likes/status')
  async likeStatus(
    @Query() query: LikeStatusQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.interactionsService.isLiked(
      query.entityType,
      query.entityId,
      req.user.sub,
    );
  }

  @Get('comments')
  async findComments(@Query() query: QueryCommentsDto) {
    return await this.interactionsService.findComments(query);
  }

  @UseGuards(JwtAuthGuard)
  @Post('comments')
  async createComment(
    @Body() dto: CreateCommentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.interactionsService.createComment(dto, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comments/:id')
  @HttpCode(HttpStatus.OK)
  async deleteComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.interactionsService.deleteComment(id, req.user);
  }
}
