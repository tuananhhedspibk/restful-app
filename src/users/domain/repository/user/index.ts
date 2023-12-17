import { UserAggregate } from '../../aggregate/user';
import { IBaseRepository } from '../base';

export abstract class IUserRepository extends IBaseRepository {
  isEmailExist: (email: string) => Promise<boolean>;
  findByEmail: (email: string) => Promise<UserAggregate | null>;
  findById: (id: string) => Promise<UserAggregate | null>;
  create: (aggregate: UserAggregate) => Promise<UserAggregate>;
  update: (aggregate: UserAggregate) => Promise<UserAggregate>;
}
