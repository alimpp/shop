import { IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateAddressDto {
  @IsString({ message: 'نام آدرس باید متن باشد' })
  @MinLength(2, { message: 'نام آدرس باید حداقل ۲ کاراکتر باشد' })
  @MaxLength(80, { message: 'نام آدرس باید حداکثر ۸۰ کاراکتر باشد' })
  name!: string;

  @IsString({ message: 'استان باید متن باشد' })
  @MinLength(2, { message: 'استان الزامی است' })
  @MaxLength(80, { message: 'استان باید حداکثر ۸۰ کاراکتر باشد' })
  province!: string;

  @IsString({ message: 'شهر باید متن باشد' })
  @MinLength(2, { message: 'شهر الزامی است' })
  @MaxLength(80, { message: 'شهر باید حداکثر ۸۰ کاراکتر باشد' })
  city!: string;

  @IsString({ message: 'آدرس باید متن باشد' })
  @MinLength(8, { message: 'آدرس باید حداقل ۸ کاراکتر باشد' })
  @MaxLength(500, { message: 'آدرس باید حداکثر ۵۰۰ کاراکتر باشد' })
  address!: string;

  @IsString({ message: 'کد پستی باید متن باشد' })
  @Length(10, 10, { message: 'کد پستی باید دقیقاً ۱۰ رقم باشد' })
  @Matches(/^\d{10}$/, { message: 'کد پستی باید ۱۰ رقم باشد' })
  postalCode!: string;
}
