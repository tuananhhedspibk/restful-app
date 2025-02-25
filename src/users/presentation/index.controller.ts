import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UseInterceptors,
  Version,
  Response,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';

import {
  Response as ExpressResponse,
  Request as ExpressRequest,
} from 'express';

import { SignupRequestDto } from './dto/signup-request';
import { SigninRequestDto } from './dto/signin-request';
import { SigninResponseDto } from './dto/signin-response';
import { GetUserRequestDto } from './dto/get-user-request';
import { GetUserResponseDto } from './dto/get-user-response';
import { UpdateUserRequestDto } from './dto/update-user-request';

import { GetUserQueryHandler } from '../application/query/get-user/handler';
import { GetUserQuery } from '../application/query/get-user/query';

import { SignupCommand } from '../application/command/signup/command';
import { SignupCommandHandler } from '../application/command/signup/handler';
import { SigninCommand } from '../application/command/signin/command';
import { SigninCommandHandler } from '../application/command/signin/handler';
import { UpdateUserCommand } from '../application/command/update-user/command';
import { UpdateUserCommandHandler } from '../application/command/update-user/handler';
import { DeleteUserCommand } from '../application/command/delete-user/command';
import { DeleteUserCommandHandler } from '../application/command/delete-user/handler';
import { CreateUserJob } from '../application/job/create-user';

import { TransactionInterceptor } from '@libs/interceptor/transaction';
import { AuthGuard } from '@libs/guard/auth';

@Controller('users')
export class UserController {
  constructor(
    private readonly signupCommandHandler: SignupCommandHandler,
    private readonly signinCommandHandler: SigninCommandHandler,
    private readonly getUserQueryHandler: GetUserQueryHandler,
    private readonly updateUserCommandHandler: UpdateUserCommandHandler,
    private readonly deleteUserCommandHandler: DeleteUserCommandHandler,
    private readonly createUserJob: CreateUserJob,
  ) {}

  @Version('1')
  @Post('/signup')
  @UseInterceptors(TransactionInterceptor)
  async signup(@Body() body: SignupRequestDto) {
    const command = new SignupCommand({
      ...body,
    });
    await this.signupCommandHandler.execute(command);
  }

  @Version('1')
  @Post('/signin')
  @UseInterceptors(TransactionInterceptor)
  async signin(
    @Body() body: SigninRequestDto,
    @Response() response: ExpressResponse<SigninResponseDto>,
  ) {
    await this.createUserJob.execute();
    const command = new SigninCommand({
      ...body,
    });

    const result = await this.signinCommandHandler.execute(command);

    response.send(result);
  }

  @Version('1')
  @Get(':id')
  @ApiBearerAuth()
  @ApiParam({
    description: 'User Id',
    type: String,
    name: 'id',
  })
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(AuthGuard)
  async getUser(
    @Request() req: ExpressRequest,
    @Param() param: GetUserRequestDto,
    @Response() response: ExpressResponse<GetUserResponseDto>,
  ) {
    const query = new GetUserQuery({
      id: param.id,
    });

    const result = await this.getUserQueryHandler.execute(query, {
      id: req['user'].userId,
      email: req['user'].email,
    });

    response.send(result);
  }

  @Version('1')
  @Put(':id')
  @ApiParam({
    description: 'User Id',
    type: String,
    name: 'id',
  })
  @ApiBearerAuth()
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(AuthGuard)
  async updateUser(
    @Request() req: ExpressRequest,
    @Param() param: { id: string },
    @Body() body: UpdateUserRequestDto,
  ) {
    const command = new UpdateUserCommand({ id: param.id, ...body });
    await this.updateUserCommandHandler.execute(command, {
      id: req['user'].userId,
      email: req['user'].email,
    });
  }

  @Version('1')
  @Delete(':id')
  @ApiParam({
    description: 'User Id',
    type: String,
    name: 'id',
  })
  @ApiBearerAuth()
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(AuthGuard)
  async deleteUser(
    @Request() req: ExpressRequest,
    @Param() param: { id: string },
  ) {
    const command = new DeleteUserCommand({ id: param.id });

    await this.deleteUserCommandHandler.execute(command, {
      id: req['user'].userId,
      email: req['user'].email,
    });
  }
}
