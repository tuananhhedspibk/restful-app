import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetUserResponseDto {
  @IsString()
  @ApiProperty({
    example: 'hyayidasda-21321dd-12e1221d2',
    required: true,
  })
  readonly id: string;

  @IsString()
  @ApiProperty({
    example: 'test@mail.com',
    required: true,
  })
  readonly email: string;

  @IsString()
  @ApiProperty({
    example: 'user name',
    required: true,
  })
  readonly name: string;
}
