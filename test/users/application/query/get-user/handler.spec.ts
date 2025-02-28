import { Test, TestingModule } from '@nestjs/testing';
import { instanceToPlain, plainToInstance } from 'class-transformer';

import { GetUserQueryHandler } from '../../../../../src/users/application/query/get-user/handler';
import { GetUserQuery } from '../../../../../src/users/application/query/get-user/query';
import { InjectionToken } from '../../../../../src/users/application/injection-token';
import { GetUserQueryResult } from '../../../../../src/users/application/query/get-user/result';

import { IUserRepository } from '../../../../../src/users/domain/repository/user';
import { UserAggregate } from '../../../../../src/users/domain/aggregate/user';

import {
  QueryError,
  QueryErrorCode,
  QueryErrorDetailCode,
} from '@libs/exception/application/query';

describe('GetUserQuery Handler testing', () => {
  let query: GetUserQuery;
  let queryHandler: GetUserQueryHandler;
  let userRepository: IUserRepository;
  let testingModule: TestingModule;
  let result: GetUserQueryResult;
  let error;

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        GetUserQueryHandler,
        {
          provide: InjectionToken.USER_REPOSITORY,
          useValue: {
            isEmailExist: jest.fn(),
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            createList: jest.fn(),
          },
        },
      ],
    }).compile();

    queryHandler = testingModule.get<GetUserQueryHandler>(GetUserQueryHandler);
    userRepository = testingModule.get(InjectionToken.USER_REPOSITORY);
  });
  afterAll(async () => {
    await testingModule.close();
  });

  describe('Normal case', () => {
    describe('Can get user info (id, email, name)', () => {
      beforeAll(async () => {
        query = new GetUserQuery({
          id: 'retrieve-user-id',
        });

        error = null;

        jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(
          plainToInstance(UserAggregate, {
            id: 'current-user-id',
            email: 'current-user@mail.com',
          }),
        );

        jest.spyOn(userRepository, 'findById').mockResolvedValue(
          plainToInstance(UserAggregate, {
            id: 'retrieve-user-id',
            email: 'retrieve-user@mail.com',
            name: 'retrieve user name',
          }),
        );

        try {
          result = await queryHandler.execute(query, {
            id: 'current-user-id',
            email: 'current-user@mail.com',
          });
        } catch (err) {
          error = err;
        }
      });

      it('Error does not occur', () => {
        expect(error).toBeNull();
      });
      it('Result data is as expected', () => {
        expect(instanceToPlain(result)).toEqual({
          id: 'retrieve-user-id',
          email: 'retrieve-user@mail.com',
          name: 'retrieve user name',
        });
      });
    });
  });

  describe('Abnormal case', () => {
    describe('Current user is not authorized to retrieve', () => {
      beforeAll(async () => {
        query = new GetUserQuery({
          id: 'retrieve-user-id',
        });

        jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(
          plainToInstance(UserAggregate, {
            id: 'current-user-id-1',
            email: 'current-user-1@mail.com',
          }),
        );

        try {
          result = await queryHandler.execute(query, {
            id: 'current-user-id',
            email: 'current-user@mail.com',
          });
        } catch (err) {
          error = err;
        }
      });

      it('Error type is QueryError', () => {
        expect(error instanceof QueryError).toBeTruthy();
      });
      it('Error code is BAD_REQUEST', () => {
        expect(error.code).toBe(QueryErrorCode.BAD_REQUEST);
      });
      it('Error detail code is UNAUTHORIZED', () => {
        expect(error.info.errorCode).toBe(QueryErrorDetailCode.UNAUTHORIZED);
      });
    });

    describe('Retrieve user id is empty', () => {
      beforeAll(async () => {
        query = new GetUserQuery({
          id: '',
        });

        jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(
          plainToInstance(UserAggregate, {
            id: 'current-user-id',
            email: 'current-user@mail.com',
          }),
        );

        try {
          result = await queryHandler.execute(query, {
            id: 'current-user-id',
            email: 'current-user@mail.com',
          });
        } catch (err) {
          error = err;
        }
      });

      it('Error type is QueryError', () => {
        expect(error instanceof QueryError).toBeTruthy();
      });
      it('Error code is BAD_REQUEST', () => {
        expect(error.code).toBe(QueryErrorCode.BAD_REQUEST);
      });
      it('Error detail code is USER_ID_CAN_NOT_BE_EMPTY', () => {
        expect(error.info.errorCode).toBe(
          QueryErrorDetailCode.USER_ID_CAN_NOT_BE_EMPTY,
        );
      });
    });

    describe('Retrieve user not found', () => {
      beforeAll(async () => {
        query = new GetUserQuery({
          id: 'retrieve-user-id',
        });

        jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(
          plainToInstance(UserAggregate, {
            id: 'current-user-id',
            email: 'current-user@mail.com',
          }),
        );

        jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

        try {
          result = await queryHandler.execute(query, {
            id: 'current-user-id',
            email: 'current-user@mail.com',
          });
        } catch (err) {
          error = err;
        }
      });

      it('Error type is QueryError', () => {
        expect(error instanceof QueryError).toBeTruthy();
      });
      it('Error code is NOT_FOUND', () => {
        expect(error.code).toBe(QueryErrorCode.NOT_FOUND);
      });
      it('Error detail code is USER_NOT_FOUND', () => {
        expect(error.info.errorCode).toBe(QueryErrorDetailCode.USER_NOT_FOUND);
      });
    });
  });
});
