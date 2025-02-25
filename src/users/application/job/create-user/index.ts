import { Inject, Injectable } from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';

import { InjectionToken } from '../../injection-token';

import { IUserRepository } from '../../../domain/repository/user';
import { UserFactory } from '../../../domain/factory/user';

import { hashPassword, randomlyGenerateSalt } from '@utils/encrypt';

import { DomainError } from '@libs/exception/domain';
import {
  CommandError,
  CommandErrorCode,
} from '@libs/exception/application/command';
import { InfrastructureError } from '@libs/exception/infrastructure';

@Injectable()
export class CreateUserJob {
  @Inject(InjectionToken.USER_REPOSITORY)
  private readonly userRepository: IUserRepository;
  @Inject()
  private readonly userFactory: UserFactory;

  private readonly NUMBER_OF_USERS = 5;

  async execute(): Promise<void> {
    const userEmails: string[] = [];

    try {
      for (let i = 0; i < this.NUMBER_OF_USERS; i++) {
        userEmails.push(`${uuidv4()}-test@mail.com`);
      }

      const userAggregates = userEmails.map((mail: string) => {
        const password = 'test@password99';
        const salt: string = randomlyGenerateSalt();
        const hashedPassword: string = hashPassword(password, salt);

        return this.userFactory.createAggregate({
          email: mail,
          password: hashedPassword,
          name: `${process.env.ENV_NAME}${mail}`,
          salt,
        });
      });

      await this.userRepository.createList(userAggregates);
    } catch (err) {
      console.error(err.stack);

      if (
        err instanceof DomainError ||
        err instanceof CommandError ||
        err instanceof InfrastructureError
      ) {
        throw err;
      }

      throw new CommandError({
        code: CommandErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error',
      });
    }
  }
}
