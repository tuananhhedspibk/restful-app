import { Expose } from 'class-transformer';
import { BaseAggregate } from '../base';
import {
  DomainError,
  DomainErrorCode,
  DomainErrorDetailCode,
} from '@libs/exception/domain';

export class UserAggregate extends BaseAggregate {
  @Expose()
  private id?: string;

  @Expose()
  email: string;

  @Expose()
  private password: string;

  @Expose()
  private salt: string;

  @Expose()
  name?: string;

  getId(): string | null {
    return this.id ? this.id : null;
  }

  setId(value: string) {
    if (this.id) {
      throw new DomainError({
        code: DomainErrorCode.BAD_REQUEST,
        message: 'User already has an id',
        info: {
          errorCode: DomainErrorDetailCode.USER_AGGREGATE_ALREADY_HAS_ID,
        },
      });
    }

    this.id = value;
  }

  setEmail(value: string) {
    this.email = value;
  }

  setName(value: string) {
    this.name = value;
  }

  getPassword(): string {
    return this.password;
  }

  setPassword(value: string) {
    this.password = value;
  }

  getSalt() {
    return this.salt;
  }

  setSalt(value: string) {
    this.salt = value;
  }
}
