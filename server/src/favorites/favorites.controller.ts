import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { FavoriteToggleDto } from './dto/favorite-toggle.dto';
import { FavoritesService } from './favorites.service';

type AuthenticatedRequest = Request & {
  user: { sub: string; role?: string };
};

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('toggle')
  @HttpCode(HttpStatus.OK)
  async toggle(
    @Body() dto: FavoriteToggleDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.favoritesService.toggle(dto.productId, req.user.sub);
  }

  @Get('status/:productId')
  async status(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.favoritesService.isFavorited(productId, req.user.sub);
  }

  @Get()
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return await this.favoritesService.findAll(
      req.user.sub,
      page ?? 1,
      limit ?? 20,
    );
  }
}
