import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';

import { IUserRepository } from '../../../../../src/users/domain/repository/user';
import { UserAggregate } from '../../../../../src/users/domain/aggregate/user';

import { UpdateUserCommand } from '../../../../../src/users/application/command/update-user/command';
import { UpdateUserCommandHandler } from '../../../../../src/users/application/command/update-user/handler';
import { InjectionToken } from '../../../../../src/users/application/injection-token';

import * as encrypt from '@utils/encrypt';

import {
  CommandErrorCode,
  CommandErrorDetailCode,
} from '@libs/exception/application/command';

describe('UpdateUserCommand Handler testing', () => {
  let command: UpdateUserCommand;
  let commandHandler: UpdateUserCommandHandler;
  let userRepository: IUserRepository;
  let testingModule: TestingModule;
  let error;

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        UpdateUserCommandHandler,
        {
          provide: InjectionToken.USER_REPOSITORY,
          useValue: {
            isEmailExist: jest.fn(),
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    commandHandler = testingModule.get<UpdateUserCommandHandler>(
      UpdateUserCommandHandler,
    );
    userRepository = testingModule.get(InjectionToken.USER_REPOSITORY);
  });
  afterAll(async () => {
    await testingModule.close();
  });

  describe('Normal case', () => {
    describe('Can execute update user', () => {
      beforeAll(async () => {
        command = new UpdateUserCommand({
          id: 'target-user-id',
          email: 'test@mail.com',
          password: 'newpassword1',
          name: 'user-name',
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

        jest.spyOn(userRepository, 'isEmailExist').mockResolvedValue(false);

        jest.spyOn(userRepository, 'update').mockResolvedValue(
          plainToInstance(UserAggregate, {
            id: 'target-user-id',
            email: 'test@email.com',
            password: 'newpasswordhashed',
            name: 'user-name',
            salt: 'salt',
          }),
        );

        jest
          .spyOn(encrypt, 'hashPassword')
          .mockReturnValue('newpasswordhashed');

        try {
          await commandHandler.execute(command, {
            id: 'target-user-id',
            email: 'old@email.com',
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
    describe('Update user id is empty', () => {
      beforeAll(async () => {
        command = new UpdateUserCommand({
          id: '',
          email: 'test@mail.com',
          password: 'newpassword1',
          name: 'user-name',
        });

        try {
          await commandHandler.execute(command, {
            id: 'target-id',
            email: 'test@mail.com',
          });
        } catch (err) {
          error = err;
        }
      });

      it('Error code is BAD_REQUEST', () => {
        expect(error.code).toEqual(CommandErrorCode.BAD_REQUEST);
      });

      it('Error detail code is UPDATE_USER_ID_CAN_NOT_BE_EMPTY', () => {
        expect(error.info.errorCode).toEqual(
          CommandErrorDetailCode.UPDATE_USER_ID_CAN_NOT_BE_EMPTY,
        );
      });
    });

    describe('Update without data', () => {
      beforeAll(async () => {
        command = new UpdateUserCommand({
          id: 'target-id',
          email: '',
          password: '',
          name: '',
        });

        try {
          await commandHandler.execute(command, {
            id: 'target-id',
            email: 'test@mail.com',
          });
        } catch (err) {
          error = err;
        }
      });

      it('Error code is BAD_REQUEST', () => {
        expect(error.code).toEqual(CommandErrorCode.BAD_REQUEST);
      });

      it('Error detail code is CAN_NOT_UPDATE_USER_WITHOUT_DATA', () => {
        expect(error.info.errorCode).toEqual(
          CommandErrorDetailCode.CAN_NOT_UPDATE_USER_WITHOUT_DATA,
        );
      });
    });

    describe('Update other user', () => {
      beforeAll(async () => {
        command = new UpdateUserCommand({
          id: 'target-id',
          email: 'test@mail.com',
          password: 'newpassword1',
          name: 'user-name',
        });

        try {
          await commandHandler.execute(command, {
            id: 'other-id',
            email: 'test@mail.com',
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
        command = new UpdateUserCommand({
          id: 'target-id',
          email: 'test@mail.com',
          password: 'newpassword1',
          name: 'user-name',
        });

        jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

        try {
          await commandHandler.execute(command, {
            id: 'target-id',
            email: 'test@mail.com',
          });
        } catch (err) {
          error = err;
        }
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

    describe('Invalid email format', () => {
      beforeAll(async () => {
        command = new UpdateUserCommand({
          id: 'target-id',
          email: 'test',
          password: 'newpassword1',
          name: 'user-name',
        });

        jest.spyOn(userRepository, 'findById').mockResolvedValue(
          plainToInstance(UserAggregate, {
            id: 'target-id',
            email: 'old@email.com',
            password: 'oldpassword1',
            name: 'old-user-name',
            salt: 'salt',
          }),
        );

        jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(
          plainToInstance(UserAggregate, {
            id: 'target-id',
            email: 'old@email.com',
            password: 'oldpassword1',
            name: 'old-user-name',
            salt: 'salt',
          }),
        );

        try {
          await commandHandler.execute(command, {
            id: 'target-id',
            email: 'old@mail.com',
          });
        } catch (err) {
          error = err;
        }
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

    describe('Email existed', () => {
      beforeAll(async () => {
        command = new UpdateUserCommand({
          id: 'target-id',
          email: 'test@mail.com',
          password: 'newpassword1',
          name: 'user-name',
        });

        jest.spyOn(userRepository, 'findById').mockResolvedValue(
          plainToInstance(UserAggregate, {
            id: 'target-id',
            email: 'test@email.com',
            password: 'oldpassword1',
            name: 'old-user-name',
            salt: 'salt',
          }),
        );

        jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(
          plainToInstance(UserAggregate, {
            id: 'target-id',
            email: 'old@email.com',
            password: 'oldpassword1',
            name: 'old-user-name',
            salt: 'salt',
          }),
        );

        jest.spyOn(userRepository, 'isEmailExist').mockResolvedValue(true);

        try {
          await commandHandler.execute(command, {
            id: 'target-id',
            email: 'old@mail.com',
          });
        } catch (err) {
          error = err;
        }
      });

      it('Error code is BAD_REQUEST', () => {
        expect(error.code).toEqual(CommandErrorCode.BAD_REQUEST);
      });

      it('Error detail code is EMAIL_EXISTED', () => {
        expect(error.info.errorCode).toEqual(
          CommandErrorDetailCode.EMAIL_EXISTED,
        );
      });
    });

    describe('Invalid password format', () => {
      beforeAll(async () => {
        command = new UpdateUserCommand({
          id: 'target-id',
          email: 'test@mail.com',
          password: 'newpassword',
          name: 'user-name',
        });

        jest.spyOn(userRepository, 'findById').mockResolvedValue(
          plainToInstance(UserAggregate, {
            id: 'target-id',
            email: 'old@email.com',
            password: 'oldpassword1',
            name: 'old-user-name',
            salt: 'salt',
          }),
        );

        jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(
          plainToInstance(UserAggregate, {
            id: 'target-id',
            email: 'old@email.com',
            password: 'oldpassword1',
            name: 'old-user-name',
            salt: 'salt',
          }),
        );

        jest.spyOn(userRepository, 'isEmailExist').mockResolvedValue(false);

        try {
          await commandHandler.execute(command, {
            id: 'target-id',
            email: 'old@mail.com',
          });
        } catch (err) {
          error = err;
        }
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

    describe('Can not update password without salt', () => {
      beforeAll(async () => {
        command = new UpdateUserCommand({
          id: 'target-id',
          email: 'test@mail.com',
          password: 'newpassword1',
          name: 'user-name',
        });

        jest.spyOn(userRepository, 'findById').mockResolvedValue(
          plainToInstance(UserAggregate, {
            id: 'target-id',
            email: 'old@email.com',
            password: 'oldpassword1',
            name: 'old-user-name',
          }),
        );

        jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(
          plainToInstance(UserAggregate, {
            id: 'target-id',
            email: 'old@email.com',
            password: 'oldpassword1',
            name: 'old-user-name',
            salt: 'salt',
          }),
        );

        jest.spyOn(userRepository, 'isEmailExist').mockResolvedValue(false);

        try {
          await commandHandler.execute(command, {
            id: 'target-id',
            email: 'old@mail.com',
          });
        } catch (err) {
          error = err;
        }
      });

      it('Error code is BAD_REQUEST', () => {
        expect(error.code).toEqual(CommandErrorCode.BAD_REQUEST);
      });

      it('Error detail code is CAN_NOT_UPDATE_PASSWORD_WITHOUT_SALT', () => {
        expect(error.info.errorCode).toEqual(
          CommandErrorDetailCode.CAN_NOT_UPDATE_PASSWORD_WITHOUT_SALT,
        );
      });
    });
  });
});
