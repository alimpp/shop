import { ArrayMaxSize, IsArray, IsUUID } from 'class-validator';

export class CreateProductOptionDto {
  @IsUUID()
  attributeId!: string;

  @IsArray()
  @ArrayMaxSize(50)
  @IsUUID(undefined, { each: true })
  valueIds!: string[];
}
