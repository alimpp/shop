import { IsEnum } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, { message: 'وضعیت سفارش نامعتبر است' })
  status!: OrderStatus;
}
