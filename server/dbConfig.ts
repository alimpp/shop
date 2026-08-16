import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import type { DataSourceOptions } from 'typeorm';
import { Category } from 'src/categories/entities/categories.entity';
import { AdminEntity } from 'src/entities/admin.entity';
import { File } from 'src/entities/fileEntity';
import { UserEntity } from 'src/entities/user.entity';

const dbPort = Number(process.env.DB_PORT ?? 5432);

export const migrationPaths = [
  join(process.cwd(), 'src/database/migrations/*{.ts,.js}'),
];

export const pgConnectionConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number.isNaN(dbPort) ? 5432 : dbPort,
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'js68002100',
  database: process.env.DB_NAME ?? 'postgres',
  entities: [UserEntity, File, AdminEntity, Category],
  synchronize: true,
};

export const pgConfig: TypeOrmModuleOptions = {
  ...pgConnectionConfig,
  autoLoadEntities: true,
};

export const pgMigrationConfig: DataSourceOptions = {
  ...pgConnectionConfig,
  migrations: migrationPaths,
  migrationsTableName: 'migrations',
};
