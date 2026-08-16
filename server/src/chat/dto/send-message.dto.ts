import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'متن پیام نمی‌تواند خالی باشد' })
  @MaxLength(5000, { message: 'متن پیام نمی‌تواند بیشتر از ۵۰۰۰ کاراکتر باشد' })
  content!: string;

  @IsOptional()
  @IsUUID(undefined, { message: 'شناسه پیام پاسخ نامعتبر است' })
  replyToId?: string;
}
