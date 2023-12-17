import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';

import { SignupCommandHandler } from './handler';
import { InjectionToken } from '../../injection-token';
import { SignupCommand } from './command';

import { UserFactory } from '../../../domain/factory/user';
import { UserAggregate } from '../../../domain/aggregate/user';
import { IUserRepository } from '../../../domain/repository/user';
import {
  CommandError,
  CommandErrorCode,
  CommandErrorDetailCode,
} from '@libs/exception/application/command';
import {
  InfrastructureError,
  InfrastructureErrorCode,
} from '@libs/exception/infrastructure';

describe('SignupCommand Handler testing', () => {
  let command: SignupCommand;
  let commandHandler: SignupCommandHandler;
  let userRepository: IUserRepository;
  let testingModule: TestingModule;
  let error;

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        SignupCommandHandler,
        UserFactory,
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
      testingModule.get<SignupCommandHandler>(SignupCommandHandler);
    userRepository = testingModule.get(InjectionToken.USER_REPOSITORY);
  });
  afterAll(async () => {
    await testingModule.close();
  });

  describe('Normal case', () => {
    describe('Can execute user signup', () => {
      beforeAll(async () => {
        command = new SignupCommand({
          email: 'test@mail.com',
          password: 'newuserpassword1',
        });

        jest.spyOn(userRepository, 'isEmailExist').mockResolvedValue(false);
        jest.spyOn(userRepository, 'create').mockResolvedValue(
          plainToInstance(UserAggregate, {
            id: 'id',
            email: 'test@mail.com',
            password: '890j13d1dj012d1$dq2d21$',
          }),
        );

        error = null;

        try {
          await commandHandler.execute(command);
        } catch (err) {
          error = err;
          console.log(err);
        }
      });

      it('Error does not occur', () => {
        expect(error).toBeNull();
      });
    });
  });

  describe('Abnormal case', () => {
    describe('Email already exists', () => {
      beforeAll(async () => {
        command = new SignupCommand({
          email: 'test@mail.com',
          password: 'newuserpassword1',
        });

        jest.spyOn(userRepository, 'isEmailExist').mockResolvedValue(true);

        error = null;

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
      it('Error detail code is EMAIL_ALREADY_EXIST', () => {
        expect(error.info.errorCode).toEqual(
          CommandErrorDetailCode.EMAIL_ALREADY_EXIST,
        );
      });
    });

    describe('Email can not be empty', () => {
      beforeAll(async () => {
        command = new SignupCommand({
          email: '',
          password: 'newuserpassword1',
        });
        error = null;

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

    describe('Password can not be empty', () => {
      beforeAll(async () => {
        command = new SignupCommand({
          email: 'test@mail.com',
          password: '',
        });
        error = null;

        jest.spyOn(userRepository, 'isEmailExist').mockResolvedValue(false);

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

    describe('Email is invalid format', () => {
      beforeAll(async () => {
        command = new SignupCommand({
          email: 'test',
          password: 'newuserpassword1',
        });

        jest.spyOn(userRepository, 'isEmailExist').mockResolvedValue(false);

        error = null;

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
      it('Error detail code is INVALID_USER_EMAIL', () => {
        expect(error.info.errorCode).toEqual(
          CommandErrorDetailCode.INVALID_USER_EMAIL,
        );
      });
    });

    describe('Password is invalid format', () => {
      describe('Password does not include any numbers', () => {
        beforeAll(async () => {
          command = new SignupCommand({
            email: 'test@mail.com',
            password: 'newuserpassword',
          });

          jest.spyOn(userRepository, 'isEmailExist').mockResolvedValue(false);

          error = null;

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
        it('Error detail code is INVALID_USER_PASSWORD', () => {
          expect(error.info.errorCode).toEqual(
            CommandErrorDetailCode.INVALID_USER_PASSWORD,
          );
        });
      });

      describe('Password does not include any characters', () => {
        beforeAll(async () => {
          command = new SignupCommand({
            email: 'test@mail.com',
            password: '11111111111',
          });

          jest.spyOn(userRepository, 'isEmailExist').mockResolvedValue(false);

          error = null;

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
        it('Error detail code is INVALID_USER_PASSWORD', () => {
          expect(error.info.errorCode).toEqual(
            CommandErrorDetailCode.INVALID_USER_PASSWORD,
          );
        });
      });

      describe('Password length is less than 8', () => {
        beforeAll(async () => {
          command = new SignupCommand({
            email: 'test@mail.com',
            password: 'abc1',
          });

          jest.spyOn(userRepository, 'isEmailExist').mockResolvedValue(false);

          error = null;

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
        it('Error detail code is INVALID_USER_PASSWORD', () => {
          expect(error.info.errorCode).toEqual(
            CommandErrorDetailCode.INVALID_USER_PASSWORD,
          );
        });
      });
    });

    describe('Can not save data to database', () => {
      beforeAll(async () => {
        command = new SignupCommand({
          email: 'test@mail.com',
          password: 'newuserpassword1',
        });
        error = null;

        jest.spyOn(userRepository, 'isEmailExist').mockResolvedValue(false);
        jest.spyOn(userRepository, 'create').mockRejectedValue(
          new InfrastructureError({
            code: InfrastructureErrorCode.INTERNAL_SERVER_ERROR,
            message: 'Internal Server Error',
          }),
        );

        try {
          await commandHandler.execute(command);
        } catch (err) {
          error = err;
        }
      });

      it('Error type is InfrastructureError', () => {
        expect(error instanceof InfrastructureError).toBeTruthy();
      });
      it('Error code is BAD_REQUEST', () => {
        expect(error.code).toEqual(
          InfrastructureErrorCode.INTERNAL_SERVER_ERROR,
        );
      });
    });
  });
});
