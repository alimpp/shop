import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class CartSelectedOptionDto {
  @IsUUID(undefined, { message: 'شناسه مقدار ویژگی نامعتبر است' })
  optionValueId!: string;
}

export class AddCartItemDto {
  @IsUUID(undefined, { message: 'شناسه محصول نامعتبر است' })
  productId!: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined && value !== '')
  @IsUUID(undefined, { message: 'شناسه وریانت نامعتبر است' })
  variantId?: string;

  @IsOptional()
  @IsArray({ message: 'ویژگی‌های انتخاب‌شده نامعتبر است' })
  @ArrayMaxSize(50, { message: 'تعداد ویژگی‌ها بیش از حد مجاز است' })
  @ValidateNested({ each: true })
  @Type(() => CartSelectedOptionDto)
  selectedOptions?: CartSelectedOptionDto[];

  @Type(() => Number)
  @IsInt({ message: 'تعداد باید عدد صحیح باشد' })
  @Min(1, { message: 'حداقل تعداد ۱ است' })
  @Max(999, { message: 'حداکثر تعداد ۹۹۹ است' })
  quantity!: number;
}
