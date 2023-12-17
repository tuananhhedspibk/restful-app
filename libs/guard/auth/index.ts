import {
  PresentationError,
  PresentationErrorCode,
  PresentationErrorDetailCode,
} from '@libs/exception/presentation';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthenTokenParamsSchema, verifyJWT } from '@utils/encrypt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this._extractTokenFromHeader(request);

    console.log(token);

    if (!token) {
      throw new PresentationError({
        code: PresentationErrorCode.BAD_REQUEST,
        message: 'Unauthorized',
        info: {
          errorCode: PresentationErrorDetailCode.UNAUTHOIZED,
        },
      });
    }

    const [valid, decoded, err] = verifyJWT(token);

    if (!valid || err) {
      throw new PresentationError({
        code: PresentationErrorCode.BAD_REQUEST,
        message: 'Unauthorized',
        info: {
          errorCode: PresentationErrorDetailCode.UNAUTHOIZED,
        },
      });
    }

    const user = AuthenTokenParamsSchema.safeParse(decoded);
    if (!user.success) {
      throw new PresentationError({
        code: PresentationErrorCode.BAD_REQUEST,
        message: 'Unauthorized',
        info: {
          errorCode: PresentationErrorDetailCode.UNAUTHOIZED,
        },
      });
    }

    request['user'] = user.data;

    return true;
  }

  private _extractTokenFromHeader(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
