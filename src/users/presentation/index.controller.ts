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

import {
  Response as ExpressResponse,
  Request as ExpressRequest,
} from 'express';

import { SignupCommand } from '../application/command/signup/command';
import { SignupRequestDto } from './dto/signup-request';
import { TransactionInterceptor } from '@libs/interceptor/transaction';
import { SignupCommandHandler } from '../application/command/signup/handler';
import { SigninRequestDto } from './dto/signin-request';
import { SigninCommand } from '../application/command/signin/command';
import { SigninCommandHandler } from '../application/command/signin/handler';
import { SigninResponseDto } from './dto/signin-response';
import { AuthGuard } from '@libs/guard/auth';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { GetUserQueryHandler } from '../application/query/get-user/handler';
import { GetUserQuery } from '../application/query/get-user/query';
import { GetUserRequestDto } from './dto/get-user-request';
import { GetUserResponseDto } from './dto/get-user-response';

@Controller('users')
export class UserController {
  constructor(
    private readonly signupCommandHandler: SignupCommandHandler,
    private readonly signinCommandHandler: SigninCommandHandler,
    private readonly getUserQueryHandler: GetUserQueryHandler,
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
  async updateProfile() {}

  @Version('1')
  @Delete(':id')
  async withdraw() {}
}
