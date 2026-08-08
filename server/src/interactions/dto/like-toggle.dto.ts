import { IsEnum, IsUUID } from 'class-validator';
import { TargetType } from '../enums/target-type.enum';

export class LikeToggleDto {
  @IsEnum(TargetType, {
    message: 'نوع موجودیت باید product یا blog باشد',
  })
  entityType!: TargetType;

  @IsUUID(undefined, {
    message: 'شناسه موجودیت نامعتبر است',
  })
  entityId!: string;
}
