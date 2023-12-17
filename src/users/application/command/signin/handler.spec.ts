import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';

import * as encrypt from '@utils/encrypt';

import { IUserRepository } from '../../../domain/repository/user';
import { SigninCommand } from './command';
import { SigninCommandHandler } from './handler';
import { InjectionToken } from '../../injection-token';
import { SigninCommandResult } from './result';
import { UserAggregate } from '../../../domain/aggregate/user';
import {
  CommandError,
  CommandErrorCode,
  CommandErrorDetailCode,
} from '@libs/exception/application/command';

describe('SigninCommand Handler testing', () => {
  let command: SigninCommand;
  let commandHandler: SigninCommandHandler;
  let userRepository: IUserRepository;
  let testingModule: TestingModule;
  let error;
  let result: SigninCommandResult;

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        SigninCommandHandler,
        {
          provide: InjectionToken.USER_REPOSITORY,
          useValue: {
            isEmailExist: jest.fn(),
            create: jest.fn(),
            findByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    commandHandler =
      testingModule.get<SigninCommandHandler>(SigninCommandHandler);
    userRepository = testingModule.get(InjectionToken.USER_REPOSITORY);
  });
  afterAll(async () => {
    await testingModule.close();
  });

  describe('Normal case', () => {
    describe('Can signin without error and receive a token', () => {
      beforeAll(async () => {
        error = null;

        command = new SigninCommand({
          email: 'test@mail.com',
          password: 'testpassword1',
        });

        jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(
          plainToInstance(UserAggregate, {
            id: 'id',
            email: 'test@mail.com',
            password: 'hashedpassword1',
            salt: 'salt',
          }),
        );

        jest.spyOn(encrypt, 'hashPassword').mockReturnValue('hashedpassword1');
        jest.spyOn(encrypt, 'generateJWT').mockReturnValue('jwt.token');

        try {
          result = await commandHandler.execute(command);
        } catch (err) {
          error = err;
        }
      });

      it('Error does not occur', () => {
        expect(error).toBeNull();
      });
      it('jwt-token is returned', () => {
        expect(result.token).toEqual('jwt.token');
      });
    });
  });

  describe('Abnormal case', () => {
    describe('When email is empty', () => {
      beforeAll(async () => {
        command = new SigninCommand({
          email: '',
          password: 'testpass1',
        });

        try {
          await commandHandler.execute(command);
        } catch (err) {
          error = err;
        }
      });

      it('Error type is CommandError', () => {
        expect(error instanceof CommandError).toBeTruthy();
      });
      it('Error code is BAD_REQUEST', () => {
        expect(error.code).toEqual(CommandErrorCode.BAD_REQUEST);
      });
      it('Error detail code is EMAIL_CAN_NOT_BE_EMPTY', () => {
        expect(error.info.errorCode).toEqual(
          CommandErrorDetailCode.EMAIL_CAN_NOT_BE_EMPTY,
        );
      });
    });

    describe('When password is empty', () => {
      beforeAll(async () => {
        command = new SigninCommand({
          email: 'test@mail.com',
          password: '',
        });

        try {
          await commandHandler.execute(command);
        } catch (err) {
          error = err;
        }
      });

      it('Error type is CommandError', () => {
        expect(error instanceof CommandError).toBeTruthy();
      });
      it('Error code is BAD_REQUEST', () => {
        expect(error.code).toEqual(CommandErrorCode.BAD_REQUEST);
      });
      it('Error detail code is PASSWORD_CAN_NOT_BE_EMPTY', () => {
        expect(error.info.errorCode).toEqual(
          CommandErrorDetailCode.PASSWORD_CAN_NOT_BE_EMPTY,
        );
      });
    });

    describe('When can not found user', () => {
      beforeAll(async () => {
        command = new SigninCommand({
          email: 'test@mail.com',
          password: 'testpass1',
        });

        jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);

        try {
          await commandHandler.execute(command);
        } catch (err) {
          error = err;
        }
      });

      it('Error type is CommandError', () => {
        expect(error instanceof CommandError).toBeTruthy();
      });
      it('Error code is NOT_FOUND', () => {
        expect(error.code).toEqual(CommandErrorCode.NOT_FOUND);
      });
      it('Error detail code is USER_NOT_FOUND', () => {
        expect(error.info.errorCode).toEqual(
          CommandErrorDetailCode.USER_NOT_FOUND,
        );
      });
    });

    describe('When password does not matching', () => {
      beforeAll(async () => {
        command = new SigninCommand({
          email: 'test@mail.com',
          password: 'testpass1',
        });

        jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(
          plainToInstance(UserAggregate, {
            id: 'id',
            email: 'test@mail.com',
            password: 'hashedpassword1',
            salt: 'salt',
          }),
        );

        jest.spyOn(encrypt, 'hashPassword').mockReturnValue('wrongpassword');

        try {
          await commandHandler.execute(command);
        } catch (err) {
          error = err;
        }
      });

      it('Error type is CommandError', () => {
        expect(error instanceof CommandError).toBeTruthy();
      });
      it('Error code is BAD_REQUEST', () => {
        expect(error.code).toEqual(CommandErrorCode.BAD_REQUEST);
      });
      it('Error detail code is PASSWORD_IS_WRONG', () => {
        expect(error.info.errorCode).toEqual(
          CommandErrorDetailCode.PASSWORD_IS_WRONG,
        );
      });
    });
  });
});
