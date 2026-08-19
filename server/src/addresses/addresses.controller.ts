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
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

type AuthenticatedRequest = Request & {
  user: { sub: string; role?: string };
};

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    return await this.addressesService.findAll(req.user.sub);
  }

  @Post()
  async create(
    @Body() dto: CreateAddressDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.addressesService.create(req.user.sub, dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAddressDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.addressesService.update(req.user.sub, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.addressesService.remove(req.user.sub, id);
  }
}
