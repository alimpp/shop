import { Type } from 'class-transformer';
import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class UpsertRatingDto {
  @IsUUID(undefined, { message: 'شناسه محصول نامعتبر است' })
  productId!: string;

  @Type(() => Number)
  @IsInt({ message: 'امتیاز باید عدد صحیح باشد' })
  @Min(1, { message: 'حداقل امتیاز ۱ است' })
  @Max(5, { message: 'حداکثر امتیاز ۵ است' })
  score!: number;
}
