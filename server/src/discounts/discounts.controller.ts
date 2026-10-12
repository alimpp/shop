import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { AdminAuth } from '../common/decorators/admin-auth.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateDiscountCodeDto } from './dto/create-discount-code.dto';
import { QueryDiscountCodesDto } from './dto/query-discount-codes.dto';
import { UpdateDiscountCodeDto } from './dto/update-discount-code.dto';
import { ValidateDiscountCodeDto } from './dto/validate-discount-code.dto';
import { DiscountsService } from './discounts.service';

@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('validate')
  validate(@Body() dto: ValidateDiscountCodeDto) {
    return this.discountsService.validateForCart(dto);
  }

  @AdminAuth('discounts', 'create')
  @Post()
  create(@Body() dto: CreateDiscountCodeDto) {
    return this.discountsService.create(dto);
  }

  @AdminAuth('discounts', 'view')
  @Get()
  findAll(@Query() query: QueryDiscountCodesDto) {
    return this.discountsService.findAll(query);
  }

  @AdminAuth('discounts', 'view')
  @Get('report')
  getUsageReport() {
    return this.discountsService.getUsageReport();
  }

  @AdminAuth('discounts', 'view')
  @Get(':id/usage')
  getUsageDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.discountsService.getUsageDetail(id);
  }

  @AdminAuth('discounts', 'view')
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.discountsService.findOne(id);
  }

  @AdminAuth('discounts', 'edit')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDiscountCodeDto,
  ) {
    return this.discountsService.update(id, dto);
  }

  @AdminAuth('discounts', 'delete')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.discountsService.remove(id);
  }
}
