import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { pgMigrationConfig } from './dbConfig';

const dataSource = new DataSource(pgMigrationConfig);

export default dataSource;
