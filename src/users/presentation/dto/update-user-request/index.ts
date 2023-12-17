import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateUserRequestDto {
  @IsString()
  @ApiProperty({
    description: 'Update Email',
    example: 'test@mail.com',
    required: false,
  })
  readonly email?: string;

  @IsString()
  @ApiProperty({
    description: 'Update Password',
    example: '12d12ddasdsad',
    required: false,
  })
  readonly password?: string;

  @IsString()
  @ApiProperty({
    description: 'Update User name',
    example: 'userName',
    required: false,
  })
  readonly name?: string;
}
