import { DomainError, DomainErrorCode } from '@libs/exception/domain';
import {
  InfrastructureError,
  InfrastructureErrorCode,
} from '@libs/exception/infrastructure';
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import {
  PresentationError,
  PresentationErrorCode,
} from '@libs/exception/presentation';
import {
  CommandError,
  CommandErrorCode,
} from '@libs/exception/application/command';
import { QueryError, QueryErrorCode } from '@libs/exception/application/query';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      catchError((err) => {
        let responseError;

        if (err instanceof CommandError) {
          switch (err.code) {
            case CommandErrorCode.BAD_REQUEST:
              responseError = new BadRequestException(
                err.message,
                JSON.stringify(err.info),
              );
              break;
            case CommandErrorCode.NOT_FOUND:
              responseError = new NotFoundException(
                err.message,
                JSON.stringify(err.info),
              );
              break;
            case CommandErrorCode.INTERNAL_SERVER_ERROR:
            default:
              responseError = new InternalServerErrorException(
                err.message,
                JSON.stringify(err.info),
              );
              break;
          }
        } else if (err instanceof QueryError) {
          switch (err.code) {
            case QueryErrorCode.BAD_REQUEST:
              responseError = new BadRequestException(
                err.message,
                JSON.stringify(err.info),
              );
              break;
            case QueryErrorCode.NOT_FOUND:
              responseError = new NotFoundException(
                err.message,
                JSON.stringify(err.info),
              );
              break;
            case QueryErrorCode.INTERNAL_SERVER_ERROR:
            default:
              responseError = new InternalServerErrorException(
                err.message,
                JSON.stringify(err.info),
              );
              break;
          }
        } else if (err instanceof DomainError) {
          switch (err.code) {
            case DomainErrorCode.BAD_REQUEST:
              responseError = new BadRequestException(
                err.message,
                JSON.stringify(err.info),
              );
              break;
            case DomainErrorCode.NOT_FOUND:
              responseError = new NotFoundException(
                err.message,
                JSON.stringify(err.info),
              );
              break;
            case DomainErrorCode.INTERNAL_SERVER_ERROR:
            default:
              responseError = new InternalServerErrorException(
                err.message,
                JSON.stringify(err.info),
              );
              break;
          }
        } else if (err instanceof InfrastructureError) {
          switch (err.code) {
            case InfrastructureErrorCode.BAD_REQUEST:
              responseError = new BadRequestException(
                err.message,
                JSON.stringify(err.info),
              );
              break;
            case InfrastructureErrorCode.NOT_FOUND:
              responseError = new NotFoundException(
                err.message,
                JSON.stringify(err.info),
              );
              break;
            case InfrastructureErrorCode.INTERNAL_SERVER_ERROR:
            default:
              responseError = new InternalServerErrorException(
                err.message,
                JSON.stringify(err.info),
              );
              break;
          }
        } else if (err instanceof PresentationError) {
          switch (err.code) {
            case PresentationErrorCode.BAD_REQUEST:
              responseError = new BadRequestException(
                err.message,
                JSON.stringify(err.info),
              );
              break;
            case PresentationErrorCode.NOT_FOUND:
              responseError = new NotFoundException(
                err.message,
                JSON.stringify(err.info),
              );
              break;
            case PresentationErrorCode.INTERNAL_SERVER_ERROR:
            default:
              responseError = new InternalServerErrorException(
                err.message,
                JSON.stringify(err.info),
              );
              break;
          }
        } else {
          responseError = new InternalServerErrorException(
            err.message || 'Internal Server Error',
          );
        }

        return throwError(() => responseError);
      }),
    );
  }
}
