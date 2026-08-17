import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class UpdateCartItemDto {
  @Type(() => Number)
  @IsInt({ message: 'تعداد باید عدد صحیح باشد' })
  @Min(1, { message: 'حداقل تعداد ۱ است' })
  @Max(999, { message: 'حداکثر تعداد ۹۹۹ است' })
  quantity!: number;
}
