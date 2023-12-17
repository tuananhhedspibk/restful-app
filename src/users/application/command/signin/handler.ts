import { CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { SigninCommand } from './command';
import { SigninCommandResult } from './result';

import { InjectionToken } from '../../injection-token';

import { IUserRepository } from '../../../domain/repository/user';
import { UserAggregate } from '../../../domain/aggregate/user';
import {
  CommandError,
  CommandErrorCode,
  CommandErrorDetailCode,
} from '@libs/exception/application/command';
import { DomainError } from '@libs/exception/domain';
import { InfrastructureError } from '@libs/exception/infrastructure';
import { generateJWT, hashPassword } from '@utils/encrypt';

@CommandHandler(SigninCommand)
export class SigninCommandHandler {
  @Inject(InjectionToken.USER_REPOSITORY)
  private readonly userRepository: IUserRepository;

  async execute(query: SigninCommand): Promise<SigninCommandResult> {
    const { email, password } = query;

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

      if (password.length === 0) {
        throw new CommandError({
          code: CommandErrorCode.BAD_REQUEST,
          message: 'Password can not be empty',
          info: {
            errorCode: CommandErrorDetailCode.PASSWORD_CAN_NOT_BE_EMPTY,
          },
        });
      }

      const userAggregate: UserAggregate | null =
        await this.userRepository.findByEmail(email);

      if (!userAggregate) {
        throw new CommandError({
          code: CommandErrorCode.NOT_FOUND,
          message: 'User not found',
          info: {
            errorCode: CommandErrorDetailCode.USER_NOT_FOUND,
          },
        });
      }

      this._validatePassword(userAggregate, password);

      const token = generateJWT(userAggregate.getId(), userAggregate.email);

      return {
        token,
      };
    } catch (err) {
      console.log(err);
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

  private _validatePassword(
    userAggregate: UserAggregate,
    barePassword: string,
  ) {
    const hashedPassword = hashPassword(barePassword, userAggregate.getSalt());

    if (hashedPassword !== userAggregate.getPassword()) {
      throw new CommandError({
        code: CommandErrorCode.BAD_REQUEST,
        message: 'Password is wrong',
        info: {
          errorCode: CommandErrorDetailCode.PASSWORD_IS_WRONG,
        },
      });
    }
  }
}
