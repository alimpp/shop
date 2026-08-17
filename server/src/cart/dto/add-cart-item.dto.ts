import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class AddCartItemDto {
  @IsUUID(undefined, { message: 'شناسه محصول نامعتبر است' })
  productId!: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined && value !== '')
  @IsUUID(undefined, { message: 'شناسه وریانت نامعتبر است' })
  variantId?: string;

  @Type(() => Number)
  @IsInt({ message: 'تعداد باید عدد صحیح باشد' })
  @Min(1, { message: 'حداقل تعداد ۱ است' })
  @Max(999, { message: 'حداکثر تعداد ۹۹۹ است' })
  quantity!: number;
}
