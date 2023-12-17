import { Request } from 'express';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { ENTITY_MANAGER_KEY } from '@libs/interceptor/transaction';
import { IBaseRepository } from '../../../domain/repository/base';

export class BaseRepository implements IBaseRepository {
  constructor(
    private dataSource: DataSource,
    private request: Request,
  ) {}

  protected getRepository<T>(entityClass: new () => T): Repository<T> {
    const entityManager: EntityManager =
      this.request && this.request[ENTITY_MANAGER_KEY]
        ? this.request[ENTITY_MANAGER_KEY]
        : this.dataSource.manager;

    return entityManager.getRepository(entityClass);
  }
}
