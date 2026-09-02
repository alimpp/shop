import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

function toEnglishDigits(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  return value
    .trim()
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[\s-]/g, '');
}

export class CreateContactMessageDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'نام الزامی است' })
  @MinLength(2, { message: 'نام باید حداقل ۲ کاراکتر باشد' })
  @MaxLength(120)
  name!: string;

  @Transform(({ value }) => toEnglishDigits(value))
  @IsString()
  @IsNotEmpty({ message: 'شماره تماس الزامی است' })
  @Matches(/^09\d{9}$/, {
    message: 'شماره تماس باید معتبر باشد (مثلاً 09121234567)',
  })
  phone!: string;

  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'متن پیام الزامی است' })
  @MinLength(5, { message: 'متن پیام باید حداقل ۵ کاراکتر باشد' })
  @MaxLength(5000)
  message!: string;
}
