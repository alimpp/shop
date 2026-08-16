import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  fristname?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  lastname?: string;

  @IsOptional()
  @ValidateIf((_o, value) => value !== undefined && value !== '')
  @IsEmail({}, { message: 'ایمیل معتبر نیست' })
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;
}
