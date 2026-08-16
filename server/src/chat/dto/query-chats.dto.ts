import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export enum ChatStatusFilter {
  ALL = 'all',
  OPEN = 'open',
  CLOSED = 'closed',
}

export enum ChatReadFilter {
  ALL = 'all',
  READ = 'read',
  UNREAD = 'unread',
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

  @IsOptional()
  @IsEnum(ChatReadFilter, { message: 'فیلتر خوانده‌شدن نامعتبر است' })
  filter?: ChatReadFilter;
}
