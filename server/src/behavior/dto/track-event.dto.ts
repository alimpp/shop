import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { BehaviorEventType } from '../enums/behavior-event-type.enum';

export class TrackBehaviorEventDto {
  @IsEnum(BehaviorEventType, { message: 'نوع رویداد نامعتبر است' })
  eventType!: BehaviorEventType;

  @IsOptional()
  @IsUUID('4', { message: 'شناسه محصول نامعتبر است' })
  productId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  sessionId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
