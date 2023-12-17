import { BaseError } from '@libs/exception/base';

export const QueryErrorCode = {
  BAD_REQUEST: 'BAD_REQUEST',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;
export type QueryErrorCode =
  (typeof QueryErrorCode)[keyof typeof QueryErrorCode];

export const QueryErrorDetailCode = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  USER_ID_CAN_NOT_BE_EMPTY: 'USER_ID_CAN_NOT_BE_EMPTY',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
} as const;
export type QueryErrorDetailCode =
  (typeof QueryErrorDetailCode)[keyof typeof QueryErrorDetailCode];

type QueryErrorParams = {
  code: QueryErrorCode;
  message: string;
  info?: { [key: string]: any };
};

export class QueryError extends BaseError {
  code: QueryErrorCode;
  info?: { [key: string]: any };

  constructor(params: QueryErrorParams) {
    super(params.message);

    this.code = params.code;
    this.info = params.info || this.info;
  }
}
