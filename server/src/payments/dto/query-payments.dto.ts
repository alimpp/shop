import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { PaymentTransactionStatus } from '../enums/payment-transaction-status.enum';
import { PaymentTransactionType } from '../enums/payment-transaction-type.enum';

export class QueryPaymentsDto {
  @IsOptional()
  @IsEnum(PaymentTransactionStatus)
  status?: PaymentTransactionStatus;

  @IsOptional()
  @IsEnum(PaymentTransactionType)
  type?: PaymentTransactionType;

  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
