import { IQueryResult } from '@nestjs/cqrs';

export class GetUserQueryResult implements IQueryResult {
  readonly id: string;
  readonly email: string;
  readonly name: string;
}
