import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetUserRequestDto {
  @IsString()
  @ApiProperty({
    example: 'hyayidasda-21321dd-12e1221d2',
    required: true,
  })
  readonly id: string;
}
