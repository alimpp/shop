import { IsString, Length } from 'class-validator';

export class CreateProductSpecificationDto {
  @IsString()
  @Length(1, 200, {
    message: 'عنوان مشخصات باید بین ۱ تا ۲۰۰ کاراکتر باشد',
  })
  title!: string;

  @IsString()
  @Length(1, 500, {
    message: 'مقدار مشخصات باید بین ۱ تا ۵۰۰ کاراکتر باشد',
  })
  value!: string;
}
