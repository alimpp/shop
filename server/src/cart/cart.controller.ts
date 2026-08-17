import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

type AuthenticatedRequest = Request & {
  user: { sub: string; role?: string };
};

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Req() req: AuthenticatedRequest) {
    return await this.cartService.getCart(req.user.sub);
  }

  @Post('items')
  @HttpCode(HttpStatus.OK)
  async addItem(
    @Body() dto: AddCartItemDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.cartService.addItem(req.user.sub, dto);
  }

  @Patch('items/:id')
  @HttpCode(HttpStatus.OK)
  async updateItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCartItemDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.cartService.updateItem(req.user.sub, id, dto);
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.OK)
  async removeItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.cartService.removeItem(req.user.sub, id);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  async clearCart(@Req() req: AuthenticatedRequest) {
    return await this.cartService.clearCart(req.user.sub);
  }
}
