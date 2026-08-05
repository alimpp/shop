import { IsBoolean, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateStoryDto {
  @IsString()
  @Length(1, 500)
  imageUrl!: string;

  @IsInt()
  @Min(1)
  duration!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
