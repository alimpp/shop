import {
  IsEnum,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TargetType } from '../enums/target-type.enum';

export class CreateCommentDto {
  @IsEnum(TargetType, {
    message: 'نوع موجودیت باید product یا blog باشد',
  })
  entityType!: TargetType;

  @IsUUID(undefined, {
    message: 'شناسه موجودیت نامعتبر است',
  })
  entityId!: string;

  @IsString()
  @MinLength(1, {
    message: 'متن کامنت نمی‌تواند خالی باشد',
  })
  @MaxLength(1000, {
    message: 'متن کامنت نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد',
  })
  content!: string;
}
