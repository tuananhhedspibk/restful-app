import {
  requestLogger,
  responseErrorLogger,
  responseLogger,
} from '@libs/middleware/logger';
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import logger from '@utils/logger';
import { Observable, map, tap } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    // intercept() method effectively wraps request/ response stream

    const request = context.switchToHttp().getRequest();

    requestLogger(request);

    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      // 200 - success response
      map((data) => {
        responseLogger({ requestId: request._id, response, data });
      }),
      // 4xx, 5xx - error response
      tap(null, (exception: HttpException | Error) => {
        try {
          responseErrorLogger({ requestId: request._id, exception });
        } catch (e) {
          logger.access_res.error(e);
        }
      }),
    );
  }
}
