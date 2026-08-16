import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class UpdateStoryDto {
  @IsOptional()
  @IsString()
  @Length(1, 500)
  imageUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
