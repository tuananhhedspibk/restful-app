import { ICommand } from '@nestjs/cqrs';

export type SigninCommandParams = {
  email: string;
  password: string;
};

export class SigninCommand implements ICommand {
  email: string;
  password: string;

  constructor(params: SigninCommandParams) {
    this.email = params.email;
    this.password = params.password;
  }
}
