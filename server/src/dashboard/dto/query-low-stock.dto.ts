import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum LowStockFilter {
  ALL = 'all',
  LOW = 'low',
  OUT = 'out',
}

export class QueryLowStockDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(LowStockFilter)
  filter?: LowStockFilter = LowStockFilter.ALL;

  @IsOptional()
  @IsString()
  search?: string;
}
