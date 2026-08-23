import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { QueryPricingProductsDto } from './dto/query-pricing-products.dto';
import { UpdateProductPricingDto } from './dto/update-product-pricing.dto';
import { ProductService } from './product.service';

@Controller('admin/products/pricing')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ProductPricingController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll(@Query() query: QueryPricingProductsDto) {
    return await this.productService.findAllForPricing(query);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductPricingDto,
  ) {
    return await this.productService.updatePricing(id, dto);
  }
}
