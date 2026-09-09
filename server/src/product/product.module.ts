import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Category } from '../categories/entities/categories.entity';
import { AttributeValue } from './entities/attribute-value.entity';
import { Attribute } from './entities/attribute.entity';
import { ProductController } from './product.controller';
import { ProductPricingController } from './product-pricing.controller';
import { ProductService } from './product.service';
import { BrandController } from './brand.controller';
import { AttributeController } from './attribute.controller';

import { ProductMedia } from './entities/product-media.entity';
import { ProductOptionValue } from './entities/product-option-value.entity';
import { ProductOption } from './entities/product-option.entity';
import { ProductTag } from './entities/product-tag.entity';
import { ProductVariantValue } from './entities/product-variant-value.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Product } from './entities/product.entity';
import { Tag } from './entities/tag.entity';

import { Brand } from './entities/brand.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { StockMovementsController } from './stock-movements.controller';
import { StockMovementsService } from './stock-movements.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductOption,
      ProductOptionValue,
      ProductMedia,
      ProductVariant,
      ProductVariantValue,
      ProductTag,
      Attribute,
      AttributeValue,
      Tag,
      Brand,
      Category,
      StockMovement,
    ]),
  ],

  controllers: [
    ProductController,
    ProductPricingController,
    BrandController,
    AttributeController,
    StockMovementsController,
  ],

  providers: [ProductService, StockMovementsService],

  exports: [ProductService, StockMovementsService],
})
export class ProductModule {}
