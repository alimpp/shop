import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaymentTransactionStatus } from '../enums/payment-transaction-status.enum';

export class UpdatePaymentStatusDto {
  @IsEnum(PaymentTransactionStatus)
  status!: PaymentTransactionStatus;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  gatewayRef?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
