import { plainToInstance } from 'class-transformer';
import { UserAggregate } from '../../aggregate/user';

export type CreateUserAggregateParams = {
  id?: string;
  email?: string;
  password?: string;
  name?: string;
  salt?: string;
};

export class UserFactory {
  createAggregate(params: CreateUserAggregateParams) {
    return plainToInstance(UserAggregate, { ...params });
  }
}
