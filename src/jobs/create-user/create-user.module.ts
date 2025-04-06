import { Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InjectionToken } from '../../users/application/injection-token';
import { CreateUserJob } from '../../users/application/job/create-user';

import { UserRepository } from '../../users/infrastructure/rdb-repository/user';
import { UserFactory } from '../../users/domain/factory/user';

import { config as rdbConfig } from '../../../config/rdb';

const InfrastructureProviders: Provider[] = [
  {
    provide: InjectionToken.USER_REPOSITORY,
    useClass: UserRepository,
  },
];

const Factories = [UserFactory];

const Jobs: Provider[] = [
  {
    provide: InjectionToken.CREATE_USER_JOB,
    useClass: CreateUserJob,
  },
];

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
      logging: rdbConfig.logging,
    }),
  ],
  providers: [...InfrastructureProviders, ...Factories, ...Jobs],
})
export class CreateUserModule {}
