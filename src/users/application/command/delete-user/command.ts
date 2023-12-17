type DeleteUserCommandParams = {
  id: string;
};

export class DeleteUserCommand {
  readonly id: string;

  constructor(params: DeleteUserCommandParams) {
    this.id = params.id;
  }
}
