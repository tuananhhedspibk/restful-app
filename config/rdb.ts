import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

dotenvConfig({ path: '.env' });

export const config = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || 5432,
  username: process.env.DATABASE_USERNAME || 'root',
  password: process.env.DATABASE_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || 'rest_app',
  entities: [],
  migrations: ['./migrations/*.ts'],
  autoLoadEntities: true,
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy(),
};

export const connectionSource = new DataSource(config as DataSourceOptions);
