import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateBannerDto {
  @IsString()
  @MaxLength(180)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(220)
  subtitle?: string;

  @IsString()
  @IsUrl({
    require_tld: false,
    require_protocol: true,
  })
  @MaxLength(500)
  imageUrl!: string;

  @IsOptional()
  @IsString()
  @IsUrl({
    require_tld: false,
    require_protocol: true,
  })
  @MaxLength(1000)
  link?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
