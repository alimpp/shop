import { IsUUID } from 'class-validator';

export class RatingQueryDto {
  @IsUUID(undefined, { message: 'شناسه محصول نامعتبر است' })
  productId!: string;
}
