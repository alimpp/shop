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
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

type AuthenticatedRequest = Request & {
  user: { sub: string; role?: string };
};

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() dto: CreateOrderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.ordersService.create(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findMine(
    @Query() query: QueryOrdersDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.ordersService.findAllForUser(req.user.sub, query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin')
  async findAll(@Query() query: QueryOrdersDto) {
    return await this.ordersService.findAllForAdmin(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/:id')
  async findOneAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return await this.ordersService.findOneForAdmin(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('admin/:id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return await this.ordersService.updateStatus(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.ordersService.findOneForUser(req.user.sub, id);
  }
}
