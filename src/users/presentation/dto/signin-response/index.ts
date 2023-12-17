import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SigninResponseDto {
  @IsString()
  @ApiProperty({
    example: 'teasdasdsadasdm.asdsadasdasdasdsa.21312s1s12s21s21s21s21',
    required: true,
  })
  readonly token: string;
}
