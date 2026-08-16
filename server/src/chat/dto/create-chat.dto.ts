import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateChatDto {
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'موضوع نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد' })
  subject?: string;
}
