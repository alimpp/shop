import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { TargetType } from '../enums/target-type.enum';

export class QueryCommentsDto {
  @IsEnum(TargetType, {
    message: 'نوع موجودیت باید product یا blog باشد',
  })
  entityType!: TargetType;

  @IsUUID(undefined, {
    message: 'شناسه موجودیت نامعتبر است',
  })
  entityId!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
