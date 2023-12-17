import { TestingModule, Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { config as rdbConfig } from '@config/rdb';

import { UserRepository } from '.';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { UserAggregate } from '../../../domain/aggregate/user';
import { UserFactory } from '../../../domain/factory/user';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '../../entity/user';
import { users } from './testData';

describe('UserRepository Testing', () => {
  let userRepository: UserRepository;
  let userRDBRepository: Repository<UserEntity>;
  let dataSource: DataSource;
  let testingModule: TestingModule;
  let result;

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: rdbConfig.host,
          port: rdbConfig.port,
          database: process.env.DATABASE_NAME || 'rest_app_test',
          username: rdbConfig.username,
          password: rdbConfig.password,
          entities: rdbConfig.entities,
          namingStrategy: rdbConfig.namingStrategy,
          logging: rdbConfig.logging,
        }),
      ],
      providers: [UserRepository, UserFactory],
    }).compile();

    userRepository =
      await testingModule.resolve<UserRepository>(UserRepository);
    dataSource = testingModule.get<DataSource>(DataSource);

    userRDBRepository = dataSource.manager.getRepository(UserEntity);

    await userRDBRepository.delete({});

    await userRDBRepository.insert(users);
  });
  afterAll(async () => {
    await userRDBRepository.delete({});
    await testingModule.close();
  });

  describe('isEmailExist func test', () => {
    describe('Email is existing', () => {
      beforeAll(async () => {
        result = await userRepository.isEmailExist('u1@mail.com');
      });

      it('Result is true', () => {
        expect(result).toBeTruthy();
      });
    });

    describe('Email not exist', () => {
      beforeAll(async () => {
        result = await userRepository.isEmailExist('not-exist@mail.com');
      });

      it('Result is false', () => {
        expect(result).not.toBeTruthy();
      });
    });
  });

  describe('findByEmail func test', () => {
    describe('User exists', () => {
      beforeAll(async () => {
        result = await userRepository.findByEmail('u1@mail.com');
      });

      it('Result is UserAggregate', () => {
        expect(result instanceof UserAggregate).toBeTruthy();
      });
      it('Result data is correct', () => {
        expect(instanceToPlain(result)).toEqual({
          id: '0bbfbd4b-8a6b-4f8b-b3f1-4ea728b092cc',
          email: 'u1@mail.com',
          password:
            '$2b$10$NVmx1D6bmEYeMApFJT5Qvus2Au3agrQATQ3KZ2dhzqWE1P3DdSJvi',
          salt: '$2b$10$NVmx1D6bmEYeMApFJT5Qvu',
        });
      });
    });

    describe('User does not exist', () => {
      beforeAll(async () => {
        result = await userRepository.findByEmail('not-exist@mail.com');
      });

      it('Result is null', () => {
        expect(result).toBeNull();
      });
    });
  });

  describe('findById func test', () => {
    describe('User exists', () => {
      beforeAll(async () => {
        result = await userRepository.findById(
          '0bbfbd4b-8a6b-4f8b-b3f1-4ea728b092cc',
        );
      });

      it('Result is UserAggregate', () => {
        expect(result instanceof UserAggregate).toBeTruthy();
      });
      it('Result data is correct', () => {
        expect(instanceToPlain(result)).toEqual({
          id: '0bbfbd4b-8a6b-4f8b-b3f1-4ea728b092cc',
          email: 'u1@mail.com',
          name: 'u-1',
          salt: '$2b$10$NVmx1D6bmEYeMApFJT5Qvu',
        });
      });
    });

    describe('User does not exist', () => {
      beforeAll(async () => {
        result = await userRepository.findById(
          '0bbfbd4b-8a6b-4f8b-b3f1-4ea999b092cc',
        );
      });

      it('Result is null', () => {
        expect(result).toBeNull();
      });
    });
  });

  describe('create func test', () => {
    beforeAll(async () => {
      const funcRes = await userRepository.create(
        plainToInstance(UserAggregate, {
          email: 'new@mail.com',
          password:
            '$3b$10$NVmx1D6bmEYeMApFJT5Qvus2Au3agrQATQ3KZ2dhzqWE1P3DdSJvi',
          salt: '$2b$10$NVmx1D6bmEYeMApFJT5Qvu',
        }),
      );

      result = await userRepository.findById(funcRes.getId());
    });

    it('Data is saved to database', () => {
      expect(result.email).toEqual('new@mail.com');
    });
  });

  describe('update func test', () => {
    beforeAll(async () => {
      const funcRes = await userRepository.update(
        plainToInstance(UserAggregate, {
          id: '0bbfbd4b-8a6b-4f8b-b3f1-4ea728b092cc',
          email: 'new-u1@mail.com',
          name: 'u-1',
          salt: '$2b$10$NVmx1D6bmEYeMApFJT5Qvu',
          password:
            '$2b$10$NVmx1D6bmEYeMApFJT5Qvus2Au3agrQATQ3KZ2dhzqWE1P3DdSJvi',
        }),
      );

      result = await userRepository.findById(funcRes.getId());
    });

    it('Data is updated', () => {
      expect(result.email).toEqual('new-u1@mail.com');
    });
  });

  describe('delete func test', () => {
    beforeAll(async () => {
      await userRepository.delete('0bbfbd4b-8a6b-4f8b-b3f1-4ea728b094cc'),
        (result = await userRepository.findById(
          '0bbfbd4b-8a6b-4f8b-b3f1-4ea728b094cc',
        ));
    });

    it('Data is deleted', () => {
      expect(result).toBeNull();
    });
  });
});
