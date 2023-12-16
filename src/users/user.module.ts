import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config as rdbConfig } from '../../config/rdb';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: rdbConfig.host,
      port: rdbConfig.port,
      database: rdbConfig.database,
      username: rdbConfig.username,
      password: rdbConfig.password,
      entities: rdbConfig.entities,
      namingStrategy: rdbConfig.namingStrategy,
    }),
  ],
})
export class UserModule {}
