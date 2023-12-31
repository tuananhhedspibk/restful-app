import { Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { config as rdbConfig } from '../../config/rdb';
import { UserController } from './presentation/index.controller';
import { UserRepository } from './infrastructure/rdb-repository/user';

import { UserFactory } from './domain/factory/user';

import { SignupCommandHandler } from './application/command/signup/handler';
import { SigninCommandHandler } from './application/command/signin/handler';
import { UpdateUserCommandHandler } from './application/command/update-user/handler';

import { GetUserQueryHandler } from './application/query/get-user/handler';

import { InjectionToken } from './application/injection-token';
import { DeleteUserCommandHandler } from './application/command/delete-user/handler';

const InfrastructureProviders: Provider[] = [
  {
    provide: InjectionToken.USER_REPOSITORY,
    useClass: UserRepository,
  },
];

const Factories = [UserFactory];

const QueryHandlers = [GetUserQueryHandler];
const CommandHandlers = [
  SignupCommandHandler,
  SigninCommandHandler,
  UpdateUserCommandHandler,
  DeleteUserCommandHandler,
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
  controllers: [UserController],
  providers: [
    ...InfrastructureProviders,
    ...Factories,
    ...QueryHandlers,
    ...CommandHandlers,
  ],
})
export class UserModule {}
