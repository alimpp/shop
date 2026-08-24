import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

const MAX_PRICE = 9999999999.99;

export class UpdateVariantPricingDto {
  @IsUUID()
  id!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_PRICE)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_PRICE)
  salePrice?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock?: number;
}

export class UpdateProductPricingDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_PRICE)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_PRICE)
  salePrice?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateVariantPricingDto)
  variants?: UpdateVariantPricingDto[];
}
