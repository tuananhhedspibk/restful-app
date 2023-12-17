import { BaseError } from '../base';

export const PresentationErrorCode = {
  BAD_REQUEST: 'BAD_REQUEST',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;
export type PresentationErrorCode =
  (typeof PresentationErrorCode)[keyof typeof PresentationErrorCode];

export const PresentationErrorDetailCode = {
  UNAUTHORIZED: 'UNAUTHORIZED',
} as const;
export type PresentationErrorDetailCode =
  (typeof PresentationErrorDetailCode)[keyof typeof PresentationErrorDetailCode];

type PresentationErrorParams = {
  code: PresentationErrorCode;
  message: string;
  info?: { [key: string]: any };
};

export class PresentationError extends BaseError {
  code: PresentationErrorCode;
  info?: { [key: string]: any };

  constructor(params: PresentationErrorParams) {
    super(params.message);

    this.code = params.code;
    this.info = params.info || null;
  }
}
