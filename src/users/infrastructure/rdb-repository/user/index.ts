import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { Request } from 'express';
import { DataSource, Repository } from 'typeorm';

import { UserAggregate } from '../../../domain/aggregate/user';
import { IUserRepository } from '../../../domain/repository/user';
import { BaseRepository } from '../base';
import { UserEntity } from '../../entity/user';
import { UserFactory } from '../../../domain/factory/user';
import {
  InfrastructureError,
  InfrastructureErrorCode,
} from '@libs/exception/infrastructure';

@Injectable({ scope: Scope.REQUEST })
export class UserRepository extends BaseRepository implements IUserRepository {
  @Inject()
  private readonly factory: UserFactory;

  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  async isEmailExist(email: string): Promise<boolean> {
    try {
      const repository = this.getRepository(UserEntity);

      const user = await this.getBaseQuery(repository)
        .where({ email })
        .getOne();

      return !!user;
    } catch (err) {
      console.error(err.stack);

      throw new InfrastructureError({
        code: InfrastructureErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error',
      });
    }
  }

  async findByEmail(email: string): Promise<UserAggregate | null> {
    try {
      const repository = this.getRepository(UserEntity);

      const user = await this.getBaseQuery(repository)
        .addSelect(['user.password', 'user.salt'])
        .where({ email })
        .getOne();

      return user ? this.factory.createAggregate({ ...user }) : null;
    } catch (err) {
      console.error(err.stack);

      throw new InfrastructureError({
        code: InfrastructureErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error',
      });
    }
  }

  async findById(id: string): Promise<UserAggregate | null> {
    try {
      const repository = this.getRepository(UserEntity);

      const user = await this.getBaseQuery(repository)
        .addSelect(['user.name', 'user.salt'])
        .where({ id })
        .getOne();

      return user ? this.factory.createAggregate({ ...user }) : null;
    } catch (err) {
      console.error(err.stack);

      throw new InfrastructureError({
        code: InfrastructureErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error',
      });
    }
  }

  async create(aggregate: UserAggregate): Promise<UserAggregate> {
    try {
      const repository = this.getRepository(UserEntity);

      const user = repository.create({
        email: aggregate.email,
        password: aggregate.getPassword(),
        name: aggregate.name,
        salt: aggregate.getSalt(),
      });

      await repository.insert(user);

      aggregate.setId(user.id);

      return aggregate;
    } catch (err) {
      console.error(err.stack);

      throw new InfrastructureError({
        code: InfrastructureErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error',
      });
    }
  }

  async createList(aggregates: UserAggregate[]): Promise<void> {
    try {
      const repository = this.getRepository(UserEntity);

      const users = aggregates.map((agg: UserAggregate) =>
        repository.create({
          email: agg.email,
          password: agg.getPassword(),
          name: agg.name,
          salt: agg.getSalt(),
        }),
      );

      await repository.upsert(users, ['email']);
    } catch (err) {
      console.error(err.stack);

      throw new InfrastructureError({
        code: InfrastructureErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error',
      });
    }
  }

  async update(aggregate: UserAggregate): Promise<UserAggregate> {
    try {
      const repository = this.getRepository(UserEntity);

      const user = repository.create({
        email: aggregate.email,
        password: aggregate.getPassword(),
        name: aggregate.name,
        salt: aggregate.getSalt(),
      });

      await repository.update(aggregate.getId(), user);

      return aggregate;
    } catch (err) {
      console.error(err.stack);

      if (err instanceof InfrastructureError) {
        throw err;
      }

      throw new InfrastructureError({
        code: InfrastructureErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error',
      });
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const repository = this.getRepository(UserEntity);

      await repository.delete(id);
    } catch (err) {
      console.error(err.stack);

      if (err instanceof InfrastructureError) {
        throw err;
      }

      throw new InfrastructureError({
        code: InfrastructureErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error',
      });
    }
  }

  private getBaseQuery(repository: Repository<UserEntity>) {
    return repository
      .createQueryBuilder('user')
      .select(['user.id', 'user.email']);
  }
}
