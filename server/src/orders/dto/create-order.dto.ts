import { IsUUID } from 'class-validator';

export class CreateOrderDto {
  @IsUUID(undefined, { message: 'شناسه آدرس نامعتبر است' })
  addressId!: string;
}
