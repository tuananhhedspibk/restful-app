import { CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { UserAggregate } from '../../../domain/aggregate/user';
import { IUserRepository } from '../../../domain/repository/user';

import { UpdateUserCommand } from './command';
import {
  CommandError,
  CommandErrorCode,
  CommandErrorDetailCode,
} from '@libs/exception/application/command';
import { InfrastructureError } from '@libs/exception/infrastructure';
import { DomainError } from '@libs/exception/domain';

import { InjectionToken } from '../../injection-token';
import { mailRegex, passwordRegex } from '@utils/constants';
import { hashPassword } from '@utils/encrypt';

@CommandHandler(UpdateUserCommand)
export class UpdateUserCommandHandler {
  @Inject(InjectionToken.USER_REPOSITORY)
  private readonly userRepository: IUserRepository;

  async execute(
    command: UpdateUserCommand,
    currentUser: { id: string; email: string },
  ): Promise<void> {
    const { id: targetUserId, email, password, name } = command;
    try {
      if (targetUserId.length === 0) {
        throw new CommandError({
          code: CommandErrorCode.BAD_REQUEST,
          message: 'Update user id can not be empty',
          info: {
            errorCode: CommandErrorDetailCode.UPDATE_USER_ID_CAN_NOT_BE_EMPTY,
          },
        });
      }

      if (!email && !password && !name) {
        throw new CommandError({
          code: CommandErrorCode.BAD_REQUEST,
          message: 'Can not update user without data',
          info: {
            errorCode: CommandErrorDetailCode.CAN_NOT_UPDATE_USER_WITHOUT_DATA,
          },
        });
      }

      if (targetUserId !== currentUser.id) {
        throw new CommandError({
          code: CommandErrorCode.BAD_REQUEST,
          message: 'Unauthorized to update user',
          info: {
            errorCode: CommandErrorDetailCode.UNAUTHORIZED,
          },
        });
      }

      const targetUserAggregate: UserAggregate | null =
        await this.userRepository.findById(targetUserId);

      if (!targetUserAggregate) {
        throw new CommandError({
          code: CommandErrorCode.NOT_FOUND,
          message: 'User not found',
          info: {
            errorCode: CommandErrorDetailCode.USER_NOT_FOUND,
          },
        });
      }

      const currentUserAggregte: UserAggregate | null =
        await this.userRepository.findByEmail(currentUser.email);

      if (
        !currentUserAggregte ||
        currentUserAggregte.getId() !== currentUser.id
      ) {
        throw new CommandError({
          code: CommandErrorCode.BAD_REQUEST,
          message: 'Unauthorized',
          info: {
            errorCode: CommandErrorDetailCode.UNAUTHORIZED,
          },
        });
      }

      await this._updateUserData(targetUserAggregate, {
        email,
        name,
        password,
      });
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

  private async _updateUserData(
    userAggregate: UserAggregate,
    {
      email,
      name,
      password,
    }: {
      email: string;
      name: string;
      password: string;
    },
  ): Promise<void> {
    if (email) {
      if (!mailRegex.test(email)) {
        throw new CommandError({
          code: CommandErrorCode.BAD_REQUEST,
          message: 'Invalid email, email must be in format xxx@yyyy.zzz',
          info: {
            errorCode: CommandErrorDetailCode.INVALID_USER_EMAIL,
          },
        });
      }

      const isEmailExist = await this.userRepository.isEmailExist(email);

      if (isEmailExist) {
        throw new CommandError({
          code: CommandErrorCode.BAD_REQUEST,
          message: 'Email existed',
          info: {
            errorCode: CommandErrorDetailCode.EMAIL_EXISTED,
          },
        });
      }

      userAggregate.setEmail(email);
    }

    if (name) {
      userAggregate.setName(name);
    }

    if (password) {
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

      if (!userAggregate.getSalt()) {
        throw new CommandError({
          code: CommandErrorCode.BAD_REQUEST,
          message: 'Can not update password',
          info: {
            errorCode:
              CommandErrorDetailCode.CAN_NOT_UPDATE_PASSWORD_WITHOUT_SALT,
          },
        });
      }

      const hashedPassword: string = hashPassword(
        password,
        userAggregate.getSalt(),
      );

      userAggregate.setPassword(hashedPassword);
    }

    await this.userRepository.update(userAggregate);
  }
}
