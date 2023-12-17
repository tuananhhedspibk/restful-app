export type SignupCommandParams = {
  email: string;
  password: string;
  name?: string;
};

export class SignupCommand {
  email: string;
  password: string;
  name?: string;

  constructor(params: SignupCommandParams) {
    this.email = params.email;
    this.password = params.password;
    this.name = params.name;
  }
}
