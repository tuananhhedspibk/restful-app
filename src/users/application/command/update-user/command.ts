type UpdateUserCommandParams = {
  id: string;
  email?: string;
  name?: string;
  password?: string;
};

export class UpdateUserCommand {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly password: string;

  constructor(params: UpdateUserCommandParams) {
    this.id = params.id;
    this.email = params.email;
    this.name = params.name;
    this.password = params.password;
  }
}
