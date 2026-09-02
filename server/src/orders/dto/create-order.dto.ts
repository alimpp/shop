import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateOrderDto {
  @IsUUID(undefined, { message: 'شناسه آدرس نامعتبر است' })
  addressId!: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim().toUpperCase();
    return trimmed.length ? trimmed : undefined;
  })
  @IsString()
  @MinLength(3)
  @MaxLength(40)
  discountCode?: string;
}
