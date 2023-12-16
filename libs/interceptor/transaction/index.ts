import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, concatMap, finalize } from 'rxjs';
import { DataSource } from 'typeorm';

export const ENTITY_MANAGER_KEY = 'ENTITY_MANAGER';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private dataSource: DataSource) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest<Request>();
    const queryRunner = this.dataSource.createQueryRunner();

    /**
     * To prevent using ReadConnection and WriteConnection to DB
     * as a Singleton Pattern (ReadConnection and WriteConnection will be GLOBAL COMMON VARIABLES)
     * will make high risk here because when ReadConnection or WriteConnection die,
     * client can not read or write data permanently
     * Via Interceptor that can intercept the incoming request,
     * starting a new transaction per incoming request
     */

    await queryRunner.connect();
    await queryRunner.startTransaction();

    /**
     * Attach queryRunner to req
     * Infrastructure repository classes can use this queryRunner to get
     * TypeORM entity 's Repository to interact (read, write) with DB
     */
    req[ENTITY_MANAGER_KEY] = queryRunner.manager;

    return next.handle().pipe(
      concatMap(async (data) => {
        await queryRunner.commitTransaction();
        return data;
      }),
      catchError(async (e) => {
        await queryRunner.rollbackTransaction();
        throw e;
      }),
      finalize(async () => {
        await queryRunner.release();
      }),
    );
  }
}
