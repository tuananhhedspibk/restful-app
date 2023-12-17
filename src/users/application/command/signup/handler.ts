import { CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { SignupCommand } from './command';
import { InjectionToken } from '../../injection-token';

import { UserFactory } from '../../../domain/factory/user';
import { UserAggregate } from '../../../domain/aggregate/user';
import { IUserRepository } from '../../../domain/repository/user';

import {
  CommandError,
  CommandErrorCode,
  CommandErrorDetailCode,
} from '@libs/exception/application/command';
import { InfrastructureError } from '@libs/exception/infrastructure';
import { DomainError } from '@libs/exception/domain';

import { hashPassword, randomlyGenerateSalt } from '@utils/encrypt';
import { mailRegex, passwordRegex } from '@utils/constants';

@CommandHandler(SignupCommand)
export class SignupCommandHandler {
  @Inject(InjectionToken.USER_REPOSITORY)
  private readonly userRepository: IUserRepository;
  @Inject()
  private readonly userFactory: UserFactory;

  async execute(command: SignupCommand): Promise<void> {
    const { email, password, name } = command;

    try {
      if (email.length === 0) {
        throw new CommandError({
          code: CommandErrorCode.BAD_REQUEST,
          message: 'Email can not be empty',
          info: {
            errorCode: CommandErrorDetailCode.EMAIL_CAN_NOT_BE_EMPTY,
          },
        });
      }

      const isEmailExist = await this.userRepository.isEmailExist(email);

      if (isEmailExist) {
        throw new CommandError({
          code: CommandErrorCode.BAD_REQUEST,
          message: 'Email already exists',
          info: {
            errorCode: CommandErrorDetailCode.EMAIL_ALREADY_EXIST,
          },
        });
      }

      if (password.length === 0) {
        throw new CommandError({
          code: CommandErrorCode.BAD_REQUEST,
          message: 'Password can not be empty',
          info: {
            errorCode: CommandErrorDetailCode.PASSWORD_CAN_NOT_BE_EMPTY,
          },
        });
      }

      if (!mailRegex.test(email)) {
        throw new CommandError({
          code: CommandErrorCode.BAD_REQUEST,
          message: 'Invalid email, email must be in format xxx@yyyy.zzz',
          info: {
            errorCode: CommandErrorDetailCode.INVALID_USER_EMAIL,
          },
        });
      }

      if (!passwordRegex.test(password)) {
        throw new CommandError({
          code: CommandErrorCode.BAD_REQUEST,
          message:
            'Invalid password, it must have at least 8 characters, at least one character and one number',
          info: {
            errorCode: CommandErrorDetailCode.INVALID_USER_PASSWORD,
          },
        });
      }

      const salt: string = randomlyGenerateSalt();
      const hashedPassword: string = hashPassword(password, salt);

      const userAggregate: UserAggregate = this.userFactory.createAggregate({});

      userAggregate.setEmail(email);
      userAggregate.setPassword(hashedPassword);
      userAggregate.setName(name);
      userAggregate.setSalt(salt);

      await this.userRepository.create(userAggregate);
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
