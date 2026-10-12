import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AdminAuth } from '../common/decorators/admin-auth.decorator';
import { QueryPricingProductsDto } from './dto/query-pricing-products.dto';
import { UpdateProductPricingDto } from './dto/update-product-pricing.dto';
import { ProductService } from './product.service';

type AuthenticatedRequest = Request & {
  user: { sub: string; role?: string };
};

@Controller('admin/products/pricing')
export class ProductPricingController {
  constructor(private readonly productService: ProductService) {}

  @AdminAuth('pricing', 'view')
  @Get()
  async findAll(@Query() query: QueryPricingProductsDto) {
    return await this.productService.findAllForPricing(query);
  }

  @AdminAuth('pricing', 'edit')
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductPricingDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.productService.updatePricing(id, dto, req.user.sub);
  }
}
