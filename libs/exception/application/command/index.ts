import { BaseError } from '@libs/exception/base';

export const CommandErrorCode = {
  BAD_REQUEST: 'BAD_REQUEST',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;
export type CommandErrorCode =
  (typeof CommandErrorCode)[keyof typeof CommandErrorCode];

export const CommandErrorDetailCode = {
  EMAIL_ALREADY_EXIST: 'EMAIL_ALREADY_EXIST',
  EMAIL_CAN_NOT_BE_EMPTY: 'EMAIL_CAN_NOT_BE_EMPTY',
  PASSWORD_CAN_NOT_BE_EMPTY: 'PASSWORD_CAN_NOT_BE_EMPTY',
  INVALID_USER_EMAIL: 'INVALID_USER_EMAIL',
  INVALID_USER_PASSWORD: 'INVALID_USER_PASSWORD',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  PASSWORD_IS_WRONG: 'PASSWORD_IS_WRONG',
  UPDATE_USER_ID_CAN_NOT_BE_EMPTY: 'UPDATE_USER_ID_CAN_NOT_BE_EMPTY',
  CAN_NOT_UPDATE_USER_WITHOUT_DATA: 'CAN_NOT_UPDATE_USER_WITHOUT_DATA',
  UNAUTHOIZED: 'UNAUTHOIZED',
  CAN_NOT_UPDATE_PASSWORD_WITHOUT_SALT: 'CAN_NOT_UPDATE_PASSWORD_WITHOUT_SALT',
  EMAIL_EXISTED: 'EMAIL_EXISTED',
} as const;
export type CommandErrorDetailCode =
  (typeof CommandErrorDetailCode)[keyof typeof CommandErrorDetailCode];

type CommandErrorParams = {
  code: CommandErrorCode;
  message: string;
  info?: { [key: string]: any };
};

export class CommandError extends BaseError {
  code: CommandErrorCode;
  info?: { [key: string]: any };

  constructor(params: CommandErrorParams) {
    super(params.message);

    this.code = params.code;
    this.info = params.info || this.info;
  }
}
