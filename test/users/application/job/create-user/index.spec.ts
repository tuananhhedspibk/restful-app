import { Test, TestingModule } from '@nestjs/testing';

import { IUserRepository } from '../../../../../src/users/domain/repository/user';
import { CreateUserJob } from '../../../../../src/users/application/job/create-user';
import { UserFactory } from '../../../../../src/users/domain/factory/user';
import { InjectionToken } from '../../../../../src/users/application/injection-token';
import {
  InfrastructureError,
  InfrastructureErrorCode,
} from '@libs/exception/infrastructure';

describe('CreateUser Job testing', () => {
  let job: CreateUserJob;
  let userRepository: IUserRepository;
  let testingModule: TestingModule;
  let error;

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        CreateUserJob,
        UserFactory,
        {
          provide: InjectionToken.USER_REPOSITORY,
          useValue: {
            createList: jest.fn(),
          },
        },
      ],
    }).compile();

    job = testingModule.get<CreateUserJob>(CreateUserJob);
    userRepository = testingModule.get(InjectionToken.USER_REPOSITORY);
  });
  afterAll(async () => {
    await testingModule.close();
  });

  describe('Normal case', () => {
    describe('Can create users list', () => {
      beforeAll(async () => {
        error = null;

        jest.spyOn(userRepository, 'createList').mockResolvedValue();

        try {
          await job.execute();
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
    describe('createList func has error', () => {
      beforeAll(async () => {
        error = null;

        jest.spyOn(userRepository, 'createList').mockRejectedValue(
          new InfrastructureError({
            code: InfrastructureErrorCode.INTERNAL_SERVER_ERROR,
            message: 'Internal Server Error',
          }),
        );

        try {
          await job.execute();
        } catch (err) {
          error = err;
        }
      });

      it('InfrastructureError should be occured', () => {
        expect(error).toBeInstanceOf(InfrastructureError);

        expect(error.code).toBe(InfrastructureErrorCode.INTERNAL_SERVER_ERROR);
        expect(error.message).toBe('Internal Server Error');
      });
    });
  });
});
