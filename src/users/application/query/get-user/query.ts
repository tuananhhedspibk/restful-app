import { IQuery } from '@nestjs/cqrs';

type GetUserQueryParams = {
  id: string;
};

export class GetUserQuery implements IQuery {
  readonly id: string;

  constructor(params: GetUserQueryParams) {
    this.id = params.id;
  }
}
