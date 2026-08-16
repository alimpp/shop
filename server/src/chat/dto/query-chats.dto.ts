import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export enum ChatStatusFilter {
  ALL = 'all',
  OPEN = 'open',
  CLOSED = 'closed',
}

export class QueryChatsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsEnum(ChatStatusFilter, { message: 'فیلتر وضعیت نامعتبر است' })
  status?: ChatStatusFilter;
}
