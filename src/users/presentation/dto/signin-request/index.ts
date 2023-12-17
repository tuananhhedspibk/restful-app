import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SigninRequestDto {
  @IsString()
  @ApiProperty({
    example: 'test@mail.com',
    required: true,
  })
  readonly email: string;

  @IsString()
  @ApiProperty({
    example: '97e8h1hd1dh1',
    required: true,
  })
  readonly password: string;
}
