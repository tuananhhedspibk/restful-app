import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { UserEntity } from '../src/users/infrastructure/entity/user';

dotenvConfig({ path: '.env' });

export const config = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USERNAME || 'root',
  password: process.env.DATABASE_PASSWORD || 'password',
  database:
    (process.env.NODE_ENV === 'test'
      ? process.env.DATABASE_NAME_TEST
      : process.env.DATABASE_NAME) || 'rest_app',
  entities: [UserEntity],
  migrations: ['./migrations/*.ts'],
  synchronize: false,
  logging: true,
  namingStrategy: new SnakeNamingStrategy(),
};

export const connectionSource = new DataSource(config as DataSourceOptions);
