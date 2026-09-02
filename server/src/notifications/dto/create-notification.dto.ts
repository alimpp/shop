import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { NotificationType } from '../enums/notification-type.enum';

export class CreateNotificationDto {
  @IsUUID(undefined, { message: 'شناسه کاربر نامعتبر است' })
  userId!: string;

  @IsString()
  @IsNotEmpty({ message: 'عنوان نمی‌تواند خالی باشد' })
  @MaxLength(200, { message: 'عنوان نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'توضیحات نمی‌تواند خالی باشد' })
  @MaxLength(2000, { message: 'توضیحات نمی‌تواند بیشتر از ۲۰۰۰ کاراکتر باشد' })
  description!: string;

  @IsEnum(NotificationType, { message: 'نوع اعلان نامعتبر است' })
  type!: NotificationType;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'لینک نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد' })
  link?: string;
}
