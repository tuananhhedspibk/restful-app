import { BaseError } from '../base';

export const InfrastructureErrorCode = {
  BAD_REQUEST: 'BAD_REQUEST',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;
export type InfrastructureErrorCode =
  (typeof InfrastructureErrorCode)[keyof typeof InfrastructureErrorCode];

export const InfrastructureErrorDetailCode = {} as const;
export type InfrastructureErrorDetailCode =
  (typeof InfrastructureErrorDetailCode)[keyof typeof InfrastructureErrorDetailCode];

type InfrastructureErrorParams = {
  code: InfrastructureErrorCode;
  message: string;
  info?: { [key: string]: any };
};

export class InfrastructureError extends BaseError {
  code: InfrastructureErrorCode;
  info?: { [key: string]: any };

  constructor(params: InfrastructureErrorParams) {
    super(params.message);

    this.code = params.code;
    this.info = params.info || null;
  }
}
