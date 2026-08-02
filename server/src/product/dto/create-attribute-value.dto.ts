import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAttributeValueDto {
  @IsString()
  @MaxLength(120)
  value!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  slug?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}

