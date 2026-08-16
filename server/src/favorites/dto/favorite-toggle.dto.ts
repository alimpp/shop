import { IsUUID } from 'class-validator';

export class FavoriteToggleDto {
  @IsUUID(undefined, {
    message: 'شناسه محصول نامعتبر است',
  })
  productId!: string;
}
