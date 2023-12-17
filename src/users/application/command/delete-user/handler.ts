import { CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { DeleteUserCommand } from './command';
import { InjectionToken } from '../../injection-token';
import { IUserRepository } from '../../../domain/repository/user';
import { UserAggregate } from '../../../domain/aggregate/user';

import {
  CommandError,
  CommandErrorCode,
  CommandErrorDetailCode,
} from '@libs/exception/application/command';

@CommandHandler(DeleteUserCommand)
export class DeleteUserCommandHandler {
  @Inject(InjectionToken.USER_REPOSITORY)
  private readonly userRepository: IUserRepository;

  async execute(
    command: DeleteUserCommand,
    currentUser: { id: string; email: string },
  ): Promise<void> {
    const { id: targetUserId } = command;

    if (targetUserId !== currentUser.id) {
      throw new CommandError({
        code: CommandErrorCode.BAD_REQUEST,
        message: 'Unauthorized to delete user',
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

    await this.userRepository.delete(targetUserAggregate.getId());
  }
}
