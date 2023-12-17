import { DomainErrorCode, DomainErrorDetailCode } from '@libs/exception/domain';
import { UserAggregate } from '.';
import { UserFactory } from '../../factory/user';
import { users } from './testData';

const factory = new UserFactory();

describe('UserAggregate testing', () => {
  let userAggregate: UserAggregate;
  let result: string | null;
  let error;

  describe('getId function testing', () => {
    describe('Normal case', () => {
      describe('UserAggregate has its own id', () => {
        beforeAll(() => {
          userAggregate = factory.createAggregate(users[0]);
          result = userAggregate.getId();
        });

        it('Can get userAggregate id', () => {
          expect(result).toEqual('id-1');
        });
      });

      describe('UserAggregate does not have its own id', () => {
        beforeAll(() => {
          userAggregate = factory.createAggregate(users[1]);
          result = userAggregate.getId();
        });

        it('null is returned', () => {
          expect(result).toBeNull();
        });
      });
    });
  });

  describe('setId function testing', () => {
    describe('Normal case', () => {
      describe('Can set userAggregate id', () => {
        beforeAll(() => {
          userAggregate = factory.createAggregate(users[1]);

          error = null;

          try {
            userAggregate.setId('id-2');
          } catch (err) {
            error = err;
          }

          result = userAggregate.getId();
        });

        it('Error does not occur', () => {
          expect(error).toBeNull();
        });
        it('userAggregate id value is as expected', () => {
          expect(result).toEqual('id-2');
        });
      });
    });

    describe('Abnormal case', () => {
      describe('UserAggregate already has an id', () => {
        beforeAll(() => {
          userAggregate = factory.createAggregate(users[0]);

          try {
            userAggregate.setId('new-id');
          } catch (err) {
            error = err;
          }
        });

        it('Error code is BAD_REQUEST', () => {
          expect(error.code).toEqual(DomainErrorCode.BAD_REQUEST);
        });
        it('Error detail code is USER_AGGREGATE_ALREADY_HAS_ID', () => {
          expect(error.info.errorCode).toEqual(
            DomainErrorDetailCode.USER_AGGREGATE_ALREADY_HAS_ID,
          );
        });
      });
    });
  });

  describe('setEmail function testing', () => {
    describe('Normal case', () => {
      describe('Can set email', () => {
        beforeAll(() => {
          userAggregate = factory.createAggregate(users[0]);

          userAggregate.setEmail('new-test-1@mail.com');
        });

        it('New email data is reflected', () => {
          expect(userAggregate.email).toEqual('new-test-1@mail.com');
        });
      });
    });
  });

  describe('setName function testing', () => {
    describe('Normal case', () => {
      describe('Can set name', () => {
        beforeAll(() => {
          userAggregate = factory.createAggregate(users[0]);

          userAggregate.setName('new-name');
        });

        it('New name data is reflected', () => {
          expect(userAggregate.name).toEqual('new-name');
        });
      });
    });
  });

  describe('getPassword function testing', () => {
    describe('Normal case', () => {
      beforeAll(() => {
        userAggregate = factory.createAggregate(users[0]);
        result = userAggregate.getPassword();
      });

      it('Can get userAggregate password', () => {
        expect(result).toEqual('password-1');
      });
    });
  });

  describe('setPassword function testing', () => {
    describe('Normal case', () => {
      describe('Can set password', () => {
        beforeAll(() => {
          userAggregate = factory.createAggregate(users[0]);

          userAggregate.setPassword('newPassword1');
          result = userAggregate.getPassword();
        });

        it('New password data is reflected', () => {
          expect(result).toEqual('newPassword1');
        });
      });
    });
  });

  describe('setSalt function testing', () => {
    describe('Normal case', () => {
      describe('Can set salt', () => {
        beforeAll(() => {
          userAggregate = factory.createAggregate(users[0]);

          userAggregate.setSalt('new-salt');
        });

        it('Salt value is reflected', () => {
          expect(userAggregate.getSalt()).toEqual('new-salt');
        });
      });
    });
  });
});
