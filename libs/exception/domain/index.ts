import { BaseError } from '../base';

export const DomainErrorCode = {
  BAD_REQUEST: 'BAD_REQUEST',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;
export type DomainErrorCode =
  (typeof DomainErrorCode)[keyof typeof DomainErrorCode];

export const DomainErrorDetailCode = {
  USER_AGGREGATE_ALREADY_HAS_ID: 'USER_AGGREGATE_ALREADY_HAS_ID',
  INVALID_USER_EMAIL: 'INVALID_USER_EMAIL',
  INVALID_USER_PASSWORD: 'INVALID_USER_PASSWORD',
  USER_PASSWORD_IS_EMPTY: 'USER_PASSWORD_IS_EMPTY',
} as const;
export type DomainErrorDetailCode =
  (typeof DomainErrorDetailCode)[keyof typeof DomainErrorDetailCode];

type DomainErrorParams = {
  info?: { [key: string]: any };
  code: DomainErrorCode;
  message: string;
};

export class DomainError extends BaseError {
  code: DomainErrorCode;
  info?: { [key: string]: any };

  constructor(params: DomainErrorParams) {
    super(params.message);

    this.code = params.code;
    this.info = params.info || null;
  }
}
