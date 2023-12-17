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
} from '@nestjs/common';

import { Response as ExpressResponse } from 'express';

import { SignupCommand } from '../application/command/signup/command';
import { SignupRequestDto } from './dto/signup-request';
import { TransactionInterceptor } from '@libs/interceptor/transaction';
import { SignupCommandHandler } from '../application/command/signup/handler';
import { SigninRequestDto } from './dto/signin-request';
import { SigninCommand } from '../application/command/signin/command';
import { SigninCommandHandler } from '../application/command/signin/handler';
import { SigninResponseDto } from './dto/signin-response';

@Controller('users')
export class UserController {
  constructor(
    private readonly signupCommandHandler: SignupCommandHandler,
    private readonly signinCommandHandler: SigninCommandHandler,
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
  async getProfile() {}

  @Version('1')
  @Put(':id')
  async updateProfile() {}

  @Version('1')
  @Delete(':id')
  async withdraw() {}
}
