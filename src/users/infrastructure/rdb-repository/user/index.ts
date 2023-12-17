import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { Request } from 'express';
import { DataSource, Repository } from 'typeorm';

import { UserAggregate } from '../../../domain/aggregate/user';
import { IUserRepository } from '../../../domain/repository/user';
import { BaseRepository } from '../base';
import { UserEntity } from '../../entity/user';
import { UserFactory } from '../../../domain/factory/user';

@Injectable({ scope: Scope.REQUEST })
export class UserRepository extends BaseRepository implements IUserRepository {
  @Inject()
  private readonly factory: UserFactory;

  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  async isEmailExist(email: string): Promise<boolean> {
    const repository = this.getRepository(UserEntity);

    const user = await this.getBaseQuery(repository).where({ email }).getOne();

    return !!user;
  }

  async findByEmail(email: string): Promise<UserAggregate | null> {
    const repository = this.getRepository(UserEntity);

    const user = await this.getBaseQuery(repository)
      .addSelect(['user.password', 'user.salt'])
      .where({ email })
      .getOne();

    return user ? this.factory.createAggregate({ ...user }) : null;
  }

  async create(aggregate: UserAggregate): Promise<UserAggregate> {
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
  }

  private getBaseQuery(repository: Repository<UserEntity>) {
    return repository
      .createQueryBuilder('user')
      .select(['user.id', 'user.email']);
  }
}
