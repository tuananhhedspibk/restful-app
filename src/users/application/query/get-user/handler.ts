import { QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { GetUserQuery } from './query';
import { GetUserQueryResult } from './result';

import { InjectionToken } from '../../injection-token';

import { IUserRepository } from '../../../domain/repository/user';
import { UserAggregate } from '../../../domain/aggregate/user';

import {
  QueryError,
  QueryErrorCode,
  QueryErrorDetailCode,
} from '@libs/exception/application/query';
import { InfrastructureError } from '@libs/exception/infrastructure';

@QueryHandler(GetUserQuery)
export class GetUserQueryHandler {
  @Inject(InjectionToken.USER_REPOSITORY)
  private readonly userRepository: IUserRepository;

  async execute(
    query: GetUserQuery,
    currentUser: {
      id: string;
      email: string;
    },
  ): Promise<GetUserQueryResult> {
    const { id: targetUserId } = query;

    try {
      const currentUserAggregte: UserAggregate | null =
        await this.userRepository.findByEmail(currentUser.email);

      if (
        !currentUserAggregte ||
        currentUserAggregte.getId() !== currentUser.id
      ) {
        throw new QueryError({
          code: QueryErrorCode.BAD_REQUEST,
          message: 'Unauthorized',
          info: {
            errorCode: QueryErrorDetailCode.UNAUTHORIZED,
          },
        });
      }

      if (targetUserId.length === 0) {
        throw new QueryError({
          code: QueryErrorCode.BAD_REQUEST,
          message: 'User id can not be empty',
          info: {
            errorCode: QueryErrorDetailCode.USER_ID_CAN_NOT_BE_EMPTY,
          },
        });
      }

      const targetUserAggregate: UserAggregate | null =
        await this.userRepository.findById(targetUserId);

      if (!targetUserAggregate) {
        throw new QueryError({
          code: QueryErrorCode.NOT_FOUND,
          message: 'User not found',
          info: {
            errorCode: QueryErrorDetailCode.USER_NOT_FOUND,
          },
        });
      }

      return {
        id: targetUserAggregate.getId(),
        email: targetUserAggregate.email,
        name: targetUserAggregate.name,
      };
    } catch (err) {
      console.error(err.stack);
      if (err instanceof QueryError || err instanceof InfrastructureError) {
        throw err;
      }

      throw new QueryError({
        code: QueryErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error',
      });
    }
  }
}
