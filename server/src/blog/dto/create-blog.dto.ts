import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { BlogStatus } from '../enums/blog-status.enum';

export class CreateBlogSectionDto {
  @IsString()
  @Length(1, 255)
  title!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;
}

export class CreateBlogDto {
  @IsString()
  @Length(3, 200)
  title!: string;

  @IsOptional()
  @IsString()
  @Length(3, 220)
  slug?: string;

  @IsString()
  summary!: string;

  @IsString()
  @MaxLength(500)
  coverImage!: string;

  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  /*
  |--------------------------------------------------------------------------
  | SEO
  |--------------------------------------------------------------------------
  */

  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  keywords?: string;

  @IsOptional()
  @IsString()
  canonical?: string;

  @IsOptional()
  @IsString()
  ogImage?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CreateBlogSectionDto)
  sections?: CreateBlogSectionDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  productIds?: string[];
}
