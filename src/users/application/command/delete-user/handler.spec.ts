import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';

import { IUserRepository } from '../../../domain/repository/user';
import { UserAggregate } from '../../../domain/aggregate/user';

import { DeleteUserCommand } from './command';
import { DeleteUserCommandHandler } from './handler';
import { InjectionToken } from '../../injection-token';
import {
  CommandErrorCode,
  CommandErrorDetailCode,
} from '@libs/exception/application/command';

describe('DeleteUserCommand Handler testing', () => {
  let command: DeleteUserCommand;
  let commandHandler: DeleteUserCommandHandler;
  let userRepository: IUserRepository;
  let testingModule: TestingModule;
  let error;

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        DeleteUserCommandHandler,
        {
          provide: InjectionToken.USER_REPOSITORY,
          useValue: {
            isEmailExist: jest.fn(),
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    commandHandler = testingModule.get<DeleteUserCommandHandler>(
      DeleteUserCommandHandler,
    );
    userRepository = testingModule.get(InjectionToken.USER_REPOSITORY);
  });
  afterAll(async () => {
    await testingModule.close();
  });

  describe('Normal case', () => {
    describe('Can delete user', () => {
      beforeAll(async () => {
        command = new DeleteUserCommand({
          id: 'target-user-id',
        });

        error = null;

        jest.spyOn(userRepository, 'findById').mockResolvedValue(
          plainToInstance(UserAggregate, {
            id: 'target-user-id',
            email: 'old@email.com',
            password: 'oldpassword1',
            name: 'old-user-name',
            salt: 'salt',
          }),
        );

        jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(
          plainToInstance(UserAggregate, {
            id: 'target-user-id',
            email: 'old@email.com',
            password: 'oldpassword1',
            name: 'old-user-name',
            salt: 'salt',
          }),
        );

        jest.spyOn(userRepository, 'delete').mockResolvedValue();

        try {
          await commandHandler.execute(command, {
            id: 'target-user-id',
            email: 'test@email.com',
          });
        } catch (err) {
          error = err;
        }
      });

      it('Error does not occur', () => {
        expect(error).toBeNull();
      });
    });
  });

  describe('Abnormal case', () => {
    describe('Unauthorized to delete user', () => {
      beforeAll(async () => {
        command = new DeleteUserCommand({
          id: 'target-user-id',
        });

        try {
          await commandHandler.execute(command, {
            id: 'another-user-id',
            email: 'test@email.com',
          });
        } catch (err) {
          error = err;
        }
      });

      it('Error code is BAD_REQUEST', () => {
        expect(error.code).toEqual(CommandErrorCode.BAD_REQUEST);
      });

      it('Error detail code is UNAUTHORIZED', () => {
        expect(error.info.errorCode).toEqual(
          CommandErrorDetailCode.UNAUTHORIZED,
        );
      });
    });

    describe('User not found', () => {
      beforeAll(async () => {
        command = new DeleteUserCommand({
          id: 'target-user-id',
        });

        jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

        try {
          await commandHandler.execute(command, {
            id: 'another-user-id',
            email: 'test@email.com',
          });
        } catch (err) {
          error = err;
        }
      });

      it('Error code is BAD_REQUEST', () => {
        expect(error.code).toEqual(CommandErrorCode.BAD_REQUEST);
      });

      it('Error detail code is UNAUTHORIZED', () => {
        expect(error.info.errorCode).toEqual(
          CommandErrorDetailCode.UNAUTHORIZED,
        );
      });
    });
  });
});
